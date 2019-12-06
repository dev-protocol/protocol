#!/usr/bin/env node
import {exec} from 'shelljs'

exec('truffle compile')
exec('truffle migrate --reset --network development')
