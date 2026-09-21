import { fetchClient } from "@/lib/fetchClients";
import { FilialBase } from "./filial.types";

export const apiGetFiliais = (): Promise<FilialBase[]> => fetchClient('/api/filiais')
