'use client'
import * as ecc from '@bitcoinerlab/secp256k1'
import { BIP32Factory } from 'bip32'
import { Network, payments } from 'bitcoinjs-lib'
import { useState } from 'react'
const { HDKey } = require('ethereum-cryptography/hdkey')

const bip32 = BIP32Factory(ecc)

const networkDogecoin = {
  messagePrefix: '\x19Dogecoin Signed Message:\n',
  bip32: {
    public: 0x02facafd,
    private: 0x02fac398
  },
  pubKeyHash: 0x1e,
  scriptHash: 0x16,
  wif: 0x9e
}

const to = 2048
const from = 0



export default function Home() {
  const [addresses, setAddresses] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const addressFromPublicKeyDogecoin = (publicKey: Buffer) => {
    // return payments.p2pkh({ pubkey: Buffer.from(publicKey), network: networkBitcoin }).address
    const account = payments.p2pkh({ pubkey: Buffer.from(publicKey), network: networkDogecoin as Network })
    return account
  }

  const createAddress = (xpub: string, type: number) => {
    if(xpub.includes('dgub')){
      const node = bip32.fromBase58(xpub, networkDogecoin)
      let listAddress: any = Array.from({ length: (to - from) }, (_, i) => i + from)
    
      const path = 'm/44\'/3\'/0\''

      
      listAddress = listAddress.map((item: any) => {
        const child = node.derivePath(type.toString()).derive(item)
        const { address, output = '', pubkey = '' } = addressFromPublicKeyDogecoin(child.publicKey)
        return {
          address,
          path: `${path}/${type}/${item}`,
          publicKey: Buffer.from(pubkey).toString('hex'),
          output: Buffer.from(output).toString('hex')
        }
      })


      return listAddress
    }else{
      const masterKey = HDKey.fromExtendedKey(xpub)

      const childHdkey = HDKey.fromExtendedKey(masterKey.deriveChild(type).publicExtendedKey)
  
      let listAddress: any = Array.from({ length: (to - from) }, (_, i) => i + from)

      const path = 'm/44\'/3\'/0\''


      listAddress = listAddress.map((item: any) => {
        const accountIndex = childHdkey.deriveChild(item)
    
        const { address, output = '', pubkey = '' } = addressFromPublicKeyDogecoin(accountIndex.publicKey as Buffer)
        return {
          address: address,
          path: `${path}/${type}/${item}`,
          publicKey: Buffer.from(pubkey).toString('hex'),
          output: Buffer.from(output).toString('hex')
        }
      })
      return listAddress
    }
  }
  
  const generateAddress = (xpub: string) => {
    try{
      let listAddressExternal = createAddress(xpub, 0)
      let listAddressInternal = createAddress(xpub, 1)
      
      return {
        listAddressExternal,
        listAddressInternal
      }
    }catch(e){
      return {}
    }
  }

  const onChangeXpub = (e: any) => {
    e.preventDefault()
    const addresses =  generateAddress(e.target.value)

    setAddresses(addresses)
    setLoading(false)
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12 h-screen">
      <h1 style={{ fontFamily: "DM Serif Display" }} className='text-[77px]'>DOGE ADDRESSES</h1>
      <div className="z-100 text-black">
        <input  onChange={e => onChangeXpub(e)} type="text" className="border-none outline-none w-[500px] px-8 py-2 rounded-2xl" placeholder="Doge master public key"/>
      </div>
      <div className="grid grid-cols-2 gap-4 text-center mt-4">
        <div>
          <h1 className="text-center p-4 text-3xl" style={{ fontFamily: "DM Serif Display" }}>External addressess</h1>
        </div>
        <div>
          <h1 className="text-center p-4 text-3xl" style={{ fontFamily: "DM Serif Display" }}>Internal addressess</h1>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4 h-5/6 overflow-scroll">
        <div>
          {addresses && (
            addresses?.listAddressExternal?.map((addr: any) => {
                return (
                  <div >
                    <span className="px-2 text-yellow-500">{addr.address}</span>
                    <span className='text-gray-500'>{addr.path}</span>
                  </div>
                )
            } )
          )}
        </div>
        <div className="text-center">
        {addresses && (
            addresses?.listAddressInternal?.map((addr: any) => {
                return (
                  <div >
                    <span className="px-2 text-yellow-500">{addr.address}</span>
                    <span className='text-gray-500'>{addr.path}</span>
                  </div>
                )
            } )
          )}
        </div>
      </div>

      <div className="text-center mt-8">
        Powered by Victoria xảo quyệt
      </div>
    </main>
  );
}
