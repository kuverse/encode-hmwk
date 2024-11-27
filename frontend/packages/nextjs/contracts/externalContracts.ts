/* eslint-disable prettier/prettier */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";
import tokenJson from "../components/assets/MyToken.json";
import { Abi } from "viem";

 const externalContracts = {
    11155111: {
        MyToken: {
        address: "0xa58d7a0636135073f38cc45e166f6f518622838c",
        abi: tokenJson.abi as Abi,
      },
    },
  } as const;
 
export default externalContracts satisfies GenericContractsDeclaration;
