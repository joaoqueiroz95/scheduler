import axios, { AxiosRequestConfig } from "axios";
import _ from "underscore";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default fetcher;
