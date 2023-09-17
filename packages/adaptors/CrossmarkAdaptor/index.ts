import sdk from '@crossmarkio/sdk'
import { EVENTS as CrossmarkEVENTS } from '@crossmarkio/sdk/dist/src/typings/extension'
import { WalletAdaptor, SignOption, TxJson, EVENTS, Network } from '@xrpl-wallet/core'

export class CrossmarkAdaptor extends WalletAdaptor {
  name = 'CROSSMARK'
  constructor() {
    super()
    sdk.on(CrossmarkEVENTS.SIGNOUT, () => this.emit(EVENTS.DISCONNECTED))
    sdk.on(CrossmarkEVENTS.USER_CHANGE, (_user) => {
      const address = sdk.getAddress() || null
      this.emit(EVENTS.ACCOUNT_CHANGED, address)
    })
    sdk.on(CrossmarkEVENTS.NETWORK_CHANGE, (network: Network) => this.emit(EVENTS.NETWORK_CHANGED, network))
  }
  init = async () => { }
  isConnected = async () => {
    return sdk.isConnected()
  }
  signIn = async () => {
    const result = await sdk.signInAndWait()
    if (!result.response.data.address) return false
    this.emit(EVENTS.CONNECTED)
    const network = await this.getNetwork()
    if (network) {
      this.emit(EVENTS.NETWORK_CHANGED, { server: network.server })
    }
    return true
  }
  signOut = async () => {
    try {
      // TODO: sdk.signOutAndWait()
      sdk.session.handleSignOut()
      this.emit(EVENTS.DISCONNECTED)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
  getAddress = async () => {
    return sdk.getAddress() || null
  }
  getNetwork = async () => {
    const result = sdk.getNetwork()
    if (!result) return null
    return { network: result.type, server: result.wss }
  }
  sign = async (txjson: Record<string, any>, _option?: SignOption) => {
    const result = await sdk.signAndWait(txjson)
    const data = result.response.data
    // TODO: add hash
    return { tx_blob: data.txBlob, hash: '' }
  }
  signAndSubmit = async (txjson: TxJson, _option?: SignOption) => {
    const result = await sdk.signAndSubmitAndWait(txjson)
    return { tx_json: result.response.data.resp.result as Record<string, any> }
  }
}
