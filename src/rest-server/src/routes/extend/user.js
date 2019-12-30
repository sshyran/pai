// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
// to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
// BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// module dependencies
const express = require('express');
const token = require('@pai/middlewares/token');
const userController = require('@pai/controllers/extend/user');
const userInputSchema = require('@pai/config/extend/user');
const param = require('@pai/middlewares/parameter');

const router = new express.Router();

router.route('/:username/expression')
  .put(token.check, param.validate(userInputSchema.userExpressionCreateInputSchema), userController.createUserExpression);

router.route('/:username/expression')
  .get(token.check, userController.getAllUserExpression);

router.route('/:username/expression/:expressionName([a-zA-Z0-9_\\-]+)')
  .get(token.check, userController.getUserExpression);

router.route('/:username/expression/:expressionName([a-zA-Z0-9_\\-]+)')
  .delete(token.check, userController.deleteUserExpression);

router.route('/:username/ssh-key/system')
  .get(token.check, userController.getUserSystemSshKey)

router.route('/:username/ssh-key/custom')
  .get(token.check, userController.getUserCustomSshKey)

router.route('/:username/ssh-key/custom')
  .put(token.check, param.validate(userInputSchema.userSshKeyCreateInputSchema), userController.createUserCustomSshKey)

router.route('/:username/ssh-key/custom/:sshKeyName([a-zA-Z0-9_\\-]+)')
  .delete(token.check, userController.deleteUserCustomSshKey)

module.exports = router;
