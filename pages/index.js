import styles from '../styles/Home.module.css'
import axios from 'axios'
import { useState, useEffect } from "react"
import useContract from '../hooks/useContract'
import { patikaadress } from '../config'
import patikajson from "../build/contracts/Patika.json"
import useConnection from '../hooks/useConnection'
import { ethers } from 'ethers'

export default function Home() {

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [fileImg, setFileImg] = useState("")
  const [price, setPrice] = useState("")

  const [nfts, setNfts] = useState([])


  const contract = useContract(patikaadress, patikajson.abi)
  const connection = useConnection();

  //buraya pinatadan aldığınız apikey ve apisecretınızı yazın. 
  //.env dosyası oluşturup bilgileri ordan çekerseniz daha profesyonel bi yaklaşım izlemiş olursunuz.
  const apikey = ""
  const apisecret = ""


  //IPFS'e "dosya" yüklemek için bu fonksiyonu kullanıyoruz.
  const sendFileToIPFS = async (e) => {
    e.preventDefault();
    if (e.target.files[0]) {
      try {
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            'pinata_api_key': apikey,
            'pinata_secret_api_key': apisecret,
            "Content-Type": "multipart/form-data"
          },
        });
        console.log(resFile)
        const ImgUrl = `https://ipfs.io/ipfs/${resFile.data.IpfsHash}`
        //console.log(resFile);
        setFileImg(ImgUrl)
        //Take a look at your Pinata Pinned section, you will see a new file added to you list.   
      } catch (error) {
        console.log("Error sending File to IPFS: ")
        console.log(error)
      }
    }
  }


  //IPFS'e JSON yüklemek için bu fonksiyonu kullanıyoruz.
  const sendJSONtoIPFS = async (e) => {
    e.preventDefault();
    try {
      const resJSON = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJsonToIPFS",
        //IPFS'e yükleyeceğimiz nesneyi json formatında oluşturuyoruz.
        data: {
          "name": name,
          "description": description,
          "image": fileImg
        },
        headers: {
          'pinata_api_key': apikey,
          'pinata_secret_api_key': apisecret,
        },
      });

      console.log("final ", `https://ipfs.io/ipfs/${resJSON.data.IpfsHash}`)

      //safeMint fonksiyonunu dersin sonunda payable hale getirdik.
      //payable fonksiyonlara işlem gönderirken ether ataçlayabilmek için "value" keywordünü kullanıyoruz.
      //price state'inin değeri miktarınca ether kontrata gönderiliyor.
      await contract.safeMint(`https://ipfs.io/ipfs/${resJSON.data.IpfsHash}`, { value: ethers.utils.parseEther(price) })

    } catch (error) {
      console.log("JSON to IPFS: ")
      console.log(error);
    }
  }

  useEffect(() => {
    connection.connect()
    if (connection.address) {
      getNFTs()
    }
  }, [connection.address])


  const getNFTs = async () => {


    //toplam nft sayısını kontrattan çekiyoruz.
    const nftCount = await contract.totalSupply()

    //her bir nftnin tokenURI'nı elde ederek axios ile fetch ediyoruz.
    for (let i = 0; i < nftCount; i++) {
      let uri = await contract.tokenURI(i);
      let data = await axios.get(uri);
      //her bir nft'nin metadasını bir nesne haline getirerek "nfts" stateimize ekliyoruz.
      let item = {
        name: data.data.name,
        description: data.data.description,
        image: data.data.image,
      }
      setNfts(nfts => ([...nfts, item]))
      console.log(item);
    }

  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title} >Patika NFT Minting App</h1>
      <div className={styles.mintNFT} >
        <form className={styles.form} onSubmit={sendJSONtoIPFS} >
          <input placeholder='name' value={name} onChange={(e) => setName(e.target.value)} />
          <br />
          <textarea placeholder='description' value={description} onChange={(e) => setDescription(e.target.value)} />
          <br />
          <input placeholder='price' value={price} onChange={(e) => setPrice(e.target.value)} />
          <br />
          <input type={"file"} onChange={sendFileToIPFS} />
          <br />
          {fileImg && (
            <img width={"200px"} src={fileImg} />
          )}
          <br />
          <button type='submit' >MINT</button>
        </form>
      </div>
      {nfts.length > 0 && (
        <div className={styles.listNFT} >
          {/* nfts state'imizde bulunan her bir nftnin metadata bilgilerini kullanıcıya aktarıyoruz. */}
          {
            nfts.map((item, i) => (
              <div key={i} className={styles.nft} >
                {item.name}
                <br />
                {item.description}
                <br />
                <img width={"200px"} src={item.image} />
                <br />
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}
