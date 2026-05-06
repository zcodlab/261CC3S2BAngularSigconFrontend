import { TipoDocumento } from "../../tipo-documento";
import { Ubigeo } from "../../ubigeo";
import { Sexo } from "../../sexo";

export interface PersonaResponse {
  idPersona: number;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombres: string;
  sexo:Sexo;
  fechaNacimiento: Date;
  ndocumento: string;
  direccion: string;
  telefono: string;
  tipoDocumento: TipoDocumento;
  ubigeo: Ubigeo;
}
