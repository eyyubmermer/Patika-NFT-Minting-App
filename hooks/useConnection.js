import { ethers } from "ethers";
import { useEffect, useState } from "react";

const useConnection = () => {

    const [signer, setSigner] = useState(undefined)
    const [provider, setProvider] = useState("")
    const [address, setAddress] = useState("")
    const [auth, setAuth] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)

    const connect = async () => {
        if (!window.alert) {
            alert("metamask is not installed!");
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);

        try {
            setIsConnecting(true);
            await provider.send("eth_requestAccounts", []);
            const signer = await provider.getSigner();
            const address = await signer.getAddress();
            setSigner(signer);
            setProvider(provider);
            setAddress(address);
            setAuth(true);
            setIsConnecting(false);
        } catch (error) {
            console.log(error);
            setIsConnecting(false);
        }
    }

    return {
        connect,
        signer,
        provider,
        address,
        auth,
        isConnecting
    };
}

export default useConnection;






// function connect() {
//     if (!window.alert) {
//         alert("metamask is not installed!");
//         return;
//     }

//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     provider
//         .send("eth_requestAccounts", [])
//         .then((accounts) => setAccount(accounts[0]))
//         .catch((err) => console.log(err))
// }
