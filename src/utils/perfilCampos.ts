export const CAMPOS_PERFIL = [
  { id: 'color_favorito', label: 'Color favorito' },
  { id: 'comida_favorita', label: 'Comida favorita' },
  { id: 'musica_favorita', label: 'Música favorita' },
  { id: 'artista_favorito', label: 'Artista favorito' },
  { id: 'alergias', label: 'Alergias' },
  { id: 'juego_favorito', label: 'Juego favorito' },
  { id: 'pelicula_favorita', label: 'Película favorita' },
  { id: 'libro_favorito', label: 'Libro favorito' },
  { id: 'deporte_favorito', label: 'Deporte favorito' },
  { id: 'streaming_favorito', label: 'Streaming favorito' },
  { id: 'marca_ropa_favorita', label: 'Marca de ropa favorita' },
  { id: 'idiomas', label: 'Idiomas' },
] as const

export type CampoPerfilId = (typeof CAMPOS_PERFIL)[number]['id']
