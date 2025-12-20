import { Text, View } from 'react-native';

export default function Sobre() {
  return (
    <View style={{paddingHorizontal:24, alignItems:"center", flex:1, backgroundColor:'#fff'}}>
      <Text style={{fontSize:28, fontWeight:'bold', marginVertical:35}}>Busca Dirceu</Text>
      <Text style={{textAlign:"center", color:'#000'}}>
        {`Busque lojas, produtos ou prestadores de serviços com apenas algumas palavras no campo \n "O que você procura?".\n\n Nós buscaremos em nossos cadastros as melhores opções dentro do Grande Dirceu\n para você.  
        
        Exclusivo da comunidade, o app conecta quem oferece com quem procura. Lojistas e prestadores de serviços ganham visibilidade, e clientes encontram com rapidez e praticidade o que desejam.

É simples e rápido!`}


      </Text>
    </View>
  );
}