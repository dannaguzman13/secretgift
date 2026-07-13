import type { Universo } from '../types/domain'

export const UNIVERSOS: Record<Universo, readonly string[]> = {
  marvel: [
    'Iron Man', 'Capitán América', 'Thor', 'Hulk', 'Black Widow',
    'Hawkeye', 'Spider-Man', 'Doctor Strange', 'Black Panther', 'Scarlet Witch',
    'Vision', 'Ant-Man', 'Wasp', 'Falcon', 'Winter Soldier',
    'Captain Marvel', 'Loki', 'Deadpool', 'Gamora', 'Rocket',
  ],
  disney: [
    'Mickey', 'Minnie', 'Donald', 'Daisy', 'Goofy',
    'Pluto', 'Elsa', 'Anna', 'Olaf', 'Simba',
    'Nala', 'Stitch', 'Moana', 'Mulán', 'Aladdín',
    'Ariel', 'Bella', 'Bestia', 'Rapunzel', 'Pinocho',
  ],
  pokemon: [
    'Pikachu', 'Charizard', 'Bulbasaur', 'Squirtle', 'Eevee',
    'Snorlax', 'Jigglypuff', 'Gengar', 'Lucario', 'Psyduck',
    'Meowth', 'Dragonite', 'Lapras', 'Mew', 'Mewtwo',
    'Togepi', 'Arcanine', 'Vaporeon', 'Jolteon', 'Flareon',
  ],
  star_wars: [
    'Luke Skywalker', 'Leia Organa', 'Han Solo', 'Darth Vader', 'Yoda',
    'Obi-Wan Kenobi', 'Chewbacca', 'R2-D2', 'C-3PO', 'Rey',
    'Finn', 'Poe Dameron', 'Kylo Ren', 'BB-8', 'Padmé Amidala',
    'Lando Calrissian', 'Boba Fett', 'Mace Windu', 'Ahsoka Tano', 'Grogu',
  ],
  harry_potter: [
    'Harry Potter', 'Hermione Granger', 'Ron Weasley', 'Draco Malfoy', 'Luna Lovegood',
    'Neville Longbottom', 'Ginny Weasley', 'Sirius Black', 'Remus Lupin', 'Albus Dumbledore',
    'Severus Snape', 'Minerva McGonagall', 'Rubeus Hagrid', 'Bellatrix Lestrange', 'Dobby',
    'Fred Weasley', 'George Weasley', 'Cho Chang', 'Cedric Diggory', 'Nymphadora Tonks',
  ],
  mitologia: [
    'Zeus', 'Hera', 'Poseidón', 'Atenea', 'Ares',
    'Apolo', 'Artemisa', 'Hermes', 'Hades', 'Perséfone',
    'Afrodita', 'Dionisio', 'Hefesto', 'Hestia', 'Deméter',
    'Cronos', 'Niké', 'Morfeo', 'Atlas', 'Selene',
  ],
  animales: [
    'León', 'Tigre', 'Lobo', 'Águila', 'Panda',
    'Zorro', 'Oso', 'Delfín', 'Koala', 'Pingüino',
    'Búho', 'Jaguar', 'Pantera', 'Ciervo', 'Lince',
    'Mapache', 'Nutria', 'Camaleón', 'Halcón', 'Loro',
  ],
  flores: [
    'Rosa', 'Tulipán', 'Girasol', 'Orquídea', 'Lirio',
    'Margarita', 'Lavanda', 'Jazmín', 'Violeta', 'Hortensia',
    'Clavel', 'Camelia', 'Dalia', 'Peonía', 'Gardenia',
    'Azucena', 'Amapola', 'Begonia', 'Hibisco', 'Magnolia',
  ],
  planetas: [
    'Mercurio', 'Venus', 'Tierra', 'Marte', 'Júpiter',
    'Saturno', 'Urano', 'Neptuno', 'Plutón', 'Ceres',
    'Eris', 'Haumea', 'Makemake', 'Sedna', 'Europa',
    'Titán', 'Ganímedes', 'Ío', 'Calisto', 'Encélado',
  ],
  piedras_preciosas: [
    'Diamante', 'Rubí', 'Zafiro', 'Esmeralda', 'Amatista',
    'Topacio', 'Ópalo', 'Jade', 'Ágata', 'Perla',
    'Turquesa', 'Granate', 'Citrino', 'Cuarzo Rosa', 'Onix',
    'Lapislázuli', 'Obsidiana', 'Malaquita', 'Ámbar', 'Coral',
  ],
} as const

export const UNIVERSO_LABELS: Record<Universo, string> = {
  marvel: 'Marvel',
  disney: 'Disney',
  pokemon: 'Pokémon',
  star_wars: 'Star Wars',
  harry_potter: 'Harry Potter',
  mitologia: 'Mitología',
  animales: 'Animales',
  flores: 'Flores',
  planetas: 'Planetas',
  piedras_preciosas: 'Piedras preciosas',
}

export function obtenerAliasesDeUniverso(universo: Universo): readonly string[] {
  return UNIVERSOS[universo]
}
