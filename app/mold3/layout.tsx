import Header from "../components/home/Header";
import Footer from "../components/home/Footer";
import "./mold3.css";

export default function Mold3Layout({ children }: { children: React.ReactNode }) {
  return <div className="mold3-scope"><a className="mold3-skip" href="#mold3-main">Ir para o conteúdo</a><Header />{children}<Footer /></div>;
}
