import { createContext, useContext } from "react";

export const ParamsContext = createContext({});
export const useParams = () => useContext(ParamsContext);
