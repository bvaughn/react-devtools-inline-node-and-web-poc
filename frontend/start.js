#!/usr/bin/env node

'use strict';

const { execSync } = require("child_process");

execSync(`yarn start`, { cwd: __dirname });