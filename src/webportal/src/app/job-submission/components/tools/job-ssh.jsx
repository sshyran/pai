import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import { cloneDeep, isEmpty, isNil } from 'lodash';
import { TooltipIcon } from '../controls/tooltip-icon';
import {
  PAI_PLUGIN,
  USERSSH_TYPE_OPTIONS,
  SSH_KEY_BITS,
} from '../../utils/constants';
import { SSHPlugin } from '../../models/plugin/ssh-plugin';
import SSHGenerator from './ssh-generator';
import { fetchUserSshPublicKey } from '../../utils/conn';

import {
  DefaultButton,
  Dropdown,
  FontWeights,
  Toggle,
  Stack,
  Text,
  TextField,
  FontSizes,
} from 'office-ui-fabric-react';

const style = {
  headerText: {
    root: {
      fontSize: FontSizes.large,
      fontWeight: FontWeights.semibold,
    },
  },
};


export const JobSSH = ({ extras, onExtrasChange }) => {
  const [sshPlugin, setSshPlugin] = useState(SSHPlugin.fromProtocol(extras));
  const [userExpressionSshKey, setUserExpressionSshKey] = useState(null);

  useEffect(() => {
    const updatedSSHPlugin = SSHPlugin.fromProtocol(extras);
    setSshPlugin(updatedSSHPlugin);
  }, [extras]);


  const _onChangeExtras = useCallback(
    (keyName, propValue) => {
      const updatedSSHPlugin = new SSHPlugin(sshPlugin);
      updatedSSHPlugin[keyName] = propValue;
      setSshPlugin(updatedSSHPlugin);
      const updatedExtras = cloneDeep(extras);
      if (isNil(updatedExtras[PAI_PLUGIN])) {
        updatedExtras[PAI_PLUGIN] = [];
      }
      const pluginBase = updatedExtras[PAI_PLUGIN];
      const oriSshIndex = pluginBase.findIndex(
        plugin => plugin.plugin === 'ssh',
      );
      if (oriSshIndex >= 0) {
        pluginBase[oriSshIndex] = updatedSSHPlugin.convertToProtocolFormat();
      } else {
        pluginBase.push(updatedSSHPlugin.convertToProtocolFormat());
      }
      onExtrasChange(updatedExtras);
    },
    [extras],
  );

  // Get possible user expression ssh key asynchronously
  // For UI, here we have two options:
  // 1. Hide the text box, override ssh key when the expression call returns.
  // 2. Show a loading icon until the expression call returns.
  // We choose option 1 for simplicity. It may cause user input disappearing in some extreme cases.
  useEffect(() => {
    const user = cookies.get('user');
    fetchUserSshPublicKey(user).then((sshPublicKey) => {
      if (sshPublicKey){
        setUserExpressionSshKey(sshPublicKey)
        setSshPlugin(sshPlugin => {
          if (!isEmpty(sshPlugin.userssh)) {
            sshPlugin.userssh.value = sshPublicKey
          }
          return sshPlugin
        })
      }}
    ).catch((err) => console.error(err));
  }, []);

  const _onUsersshTypeChange = useCallback(
    (_, item) => {
      _onChangeExtras('userssh', {
        type: item.key,
        value: '',
      });
    },
    [extras, _onChangeExtras],
  );

  const _onUsersshValueChange = useCallback(
    e => {
      _onChangeExtras('userssh', {
        ...sshPlugin.userssh,
        value: e.target.value,
      });
    },
    [extras, _onChangeExtras],
  );

  const _onUsersshEnable = useCallback(
    (_, checked) => {
      if (!checked) {
        _onChangeExtras('userssh', {});
      } else {
        // use Callback to get latest user expression ssh key
        setUserExpressionSshKey(userExpressionSshKey => {
          if (userExpressionSshKey){
            _onChangeExtras('userssh', {
              type: 'custom',
              value: userExpressionSshKey,
            });
          } else{
            _onChangeExtras('userssh', {
              type: 'custom',
              value: '',
            });
          }
          return userExpressionSshKey
        })
      }
    },
    [_onChangeExtras],
  );

  const [sshGenerator, setSshGenerator] = useState({ isOpen: false });
  const openSshGenerator = (bits, ev) => {
    setSshGenerator({
      isOpen: true,
      bits: SSH_KEY_BITS,
    });
  };
  const hideSshGenerator = () => {
    setSshGenerator({ isOpen: false });
  };

  const _onSshKeysGenerated = sshKeys => {
    _onChangeExtras('userssh', {
      ...sshPlugin.userssh,
      value: sshKeys.public,
    });
  };

  return (
    <Stack gap='m' styles={{ root: { height: '100%' } }}>
      <Stack horizontal gap='s1'>
        <Text styles={style.headerText}>SSH</Text>
        <TooltipIcon
          content={`Choose SSH public key for job. Users should maintain the SSH private key themselves.`}
        />
      </Stack>
      <Stack horizontal gap='s1'>
        <Toggle
          label={'Enable User SSH'}
          inlineLabel={true}
          checked={!isEmpty(sshPlugin.userssh)}
          onChange={_onUsersshEnable}
        />
        <TooltipIcon
          content={
            'Enable User SSH to allow user attach job containers through corresponding ssh private key. You can enter your own ssh pub key or use SSH Key Generator to generate ssh key pair.'
          }
        />
      </Stack>
      { (!userExpressionSshKey) && (!isEmpty(sshPlugin.userssh)) && (
        <Stack horizontal gap='l1'>
          <Dropdown
            placeholder='Select user ssh key type...'
            options={USERSSH_TYPE_OPTIONS}
            onChange={_onUsersshTypeChange}
            selectedKey={sshPlugin.userssh.type}
            disabled={Object.keys(USERSSH_TYPE_OPTIONS).length <= 1}
          />
          <TextField
            placeholder='Enter ssh public key'
            disabled={sshPlugin.userssh.type === 'none'}
            errorMessage={
              isEmpty(sshPlugin.getUserSshValue())
                ? 'Please Enter Valid SSH public key'
                : null
            }
            onChange={_onUsersshValueChange}
            value={sshPlugin.getUserSshValue()}
          />
          <DefaultButton onClick={ev => openSshGenerator(ev)}>
            SSH Key Generator
          </DefaultButton>
          {sshGenerator.isOpen && (
            <SSHGenerator
              isOpen={sshGenerator.isOpen}
              bits={sshGenerator.bits}
              hide={hideSshGenerator}
              onSshKeysChange={_onSshKeysGenerated}
            />
          )}
        </Stack>
      )}
    </Stack>
  );
};

JobSSH.propTypes = {
  extras: PropTypes.object,
  onExtrasChange: PropTypes.func.isRequired,
};
