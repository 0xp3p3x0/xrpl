'use client'
import Image from 'next/image'
import { WalletAdaptor, WalletClient } from '@xrpl-wallet/core'
import { XummAdaptor, CrossmarkAdaptor } from '@xrpl-wallet/adaptors'
import { useEffect, useState } from 'react'


export default function Home() {
  const [walletClient, setWalletClient] = useState<WalletClient<WalletAdaptor>>()
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    if (walletClient === undefined) return
    walletClient.onAccountChange((address) => setAddress(address))
    walletClient.onConnected(async () => {
      setAddress(await walletClient.getAddress())
    })
    walletClient.onDisconnected(() => {
      console.log('disconnected')
      setAddress(null)
    })
  }, [walletClient])

  const select = (adaptor: 'xumm' | 'crossmark') => {
    if (adaptor === 'xumm') {
      const xumm = new XummAdaptor({ apiKey: 'api-key', apiSecret: "api-secret" })
      setWalletClient(new WalletClient(xumm))
    } else {
      const crossmark = new CrossmarkAdaptor()
      setWalletClient(new WalletClient(crossmark))
    }
  }
  const signIn = async () => {
    if (walletClient === undefined) return
    await walletClient.signIn()
  }
  const signOut = async () => {
    if (walletClient === undefined) return
    await walletClient.signOut()
  }
  const sendTx = async () => {
    if (walletClient === undefined) return
    const tx = await walletClient.autofill({ TransactionType: 'AccountSet' })
    const result = await walletClient.signAndSubmit(tx)
    alert(JSON.stringify(result, null, '  '))
  }
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="relative flex place-items-center mb-16">
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>
      {!walletClient &&
        <div className='flex space-x-2'>
          <button className='btn btn-outline btn-primary' onClick={() => select('xumm')}>Xumm</button>
          <button className='btn btn-outline btn-primary' onClick={() => select('crossmark')}>Crossmark</button>
        </div>
      }
      {walletClient &&
        <>
          <div className='flex space-x-2 mb-8'>
            {address ?
              <button className='btn btn-outline btn-primary' onClick={signOut}>SignOut</button>
              :
              <button className='btn btn-primary' onClick={signIn}>Connect to {walletClient.walletName}</button>
            }
          </div>
          {address &&
            <div>
              <div>{address}</div>
              <button className='btn btn-primary' onClick={sendTx}>Send Transaction</button>
            </div>
          }
        </>
      }

    </main>
  )
}
