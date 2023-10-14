import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Layout from "../components/Layout";
import "../lib/main.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </LocalizationProvider>
  );
}
