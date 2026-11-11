import checkIcon from "../../assets/icons/checkcircle.png"
import './Modal.css'

interface ModalProps {
    aberto: boolean
    tipo: "login" | "cadastro"
    onFechar: () => void
}

export default function Modal({aberto, tipo, onFechar}: ModalProps) {
    if (!aberto) return null

    return (
        <div className="modal">
            <div className="modal-content">
                <img src={checkIcon} alt="Check circle icon" />
                <h3>{tipo === "login" ? "LOGIN" : "CADASTRO"} EFETUADO</h3>
                <button onClick={onFechar}>OK</button>
            </div>
        </div>
    )
}