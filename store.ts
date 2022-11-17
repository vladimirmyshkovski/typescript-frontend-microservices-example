import { Module } from 'vuex-simple'

import AuthModule from '~/logic/auth/module'
import AddressModule from '~/logic/address/module'
/**
 * We use typed store with different modules inside.
 *
 * Root level store should only contain links to other modules.
 * It might have some utility or shared data in the root state.
 *
 * @see https://github.com/sascha245/vuex-simple#root-state
 */
export default class TypedStore {
  @Module()
  public auth = new AuthModule()

  @Module()
  public address = new AddressModule()
}
