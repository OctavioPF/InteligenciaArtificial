
async function getData(){
    const datosCasasR = await fetch("datos.json");
    const datosCasas = await datosCasasR.json();
    var datosLimpios = datosCasas.map(casa=>(
        {precio:casa.Precio,
        cuartos:casa.NumeroDeCuartosPromedio}));
    datosLimpios = datosLimpios.filter(casa=>(
        casa.precio!=null && casa.cuartos !=null));
    return datosLimpios;
}
async function cargarModelo() {
    const uploadJSONInput = document.getElementById('upload-json');
    const uploadWeightsInput = document.getElementById('upload-weights');
    
    modelo = await tf.LoadLayersModel(tf.io.browserFiles(
    
    ))
    
}

async function verCurvaInferencia() {
    var data = await getData();
    var tensorData = await convertirDatosATensores(data);
    const{entradasMax,entradasMin,etiquetasMin,EtiquetasMax} = tensorData
    const [xs,preds] = tf.tidy(()=>{
        const xs = tf.linspace(0,1,100);
        const preds = modelo.predict(xs.reshape([100,1]));
        const desnormX = xs.mul(entradasMax.sub(entradasMIn)).add(EntradasMin);
        const desnormY = preds.mul(EtiquetasMax.sub(etiquetasMin)).add(etiquetasMin);

    return [desnormX.dataSync(),desnormY.dataSync()];
    
});

const puntosPrediccion = Array.from(xs).map((val,i)=>{
    return{x:val,y:preds[i]};
});

const puntosOriginales = data.map(d=>({
    x: d.cuartos, y: d.precio,
    }));

function vizualizarDatos(){
    const valores = datos.map(d=>(
        {x:d.cuartos,y:d.precio}));

    tfvis.render.scatterplot(
        {name:'Cuartos vs Precio'},
        {values:valores},
        {
            xLabel:'Cuartos',
            yLabel:'Precio',
            height:'300'
        })};

function crearModelo() {
    const modelo = tf.sequential();

    modelo.add(tf.layers.dense(
        {inputShape:[1], units:1, useBias:true}));
    modelo.add(tf.layers.dense(
        {units:1, useBias:true}));
        return modelo;
}

function convertirDatosATensores(data) {
    return tf.tidy(()=>{
        const entradas=data.map(d=>d.cuartos);
        const etiquetas=data.map(d=>d.precio);
        const tensorEntrada=tf.tensor2d(entradas, [entradas.length,1]);
        const tensorEtiqueta=tf.tensor2d(etiquetas, [etiquetas.length,1]);

        const EntradasMax = tensorEntradas.max();
        const EntradasMin = tensorEntradas.min();
        const EtiquetasMax = tensorEtiquetas.max();
        const EtiquetasMin = tensorEtiquetas.min();

        const entradasNormalizadas = tensorEntradas.sub(entradasMin)
        .div(EntradasMax.sub(entradasMin));
        const etiquetasNormalizadas = tensorEtiquetas.sub(etiquetasMin)
        .div(EtiquetasMax.sub(etiquetasMin));

        return{
            entradas:entradasNormalizadas,
            etiquetas:etiquetasNormalizadas,
            EntradasMax,
            entradasMin,
            EtiquetasMax,
            etiquetasMin
        } 
    });
}

const optimizador = tf.train.adam();
const funcion_perdida = tf.losses.meanSquaredError;
const metrica = ['mse'];

async function entrenarModelo(model, inputs, labels) {
    model.compile({
        optimizer:optimizador,
        loss:funcion_perdida,
        metrics:metricas,
    });

    const surface = {name:'Muestra Historial',tab:'Entrenamientos'};
    const tamanioBatch = 28;
    const epochs = 58;
    const history = [];

    return await model.fit(inputs,labels,{
        tamanioBatch,
        epochs,
        shuffle:true
        callbacks:{
            onEpochEnd:(epoch,log)=>{
            tfvis.show.history(surface,history,['loss','mse']);
            if (stopTrainig) {
                modelo.stopTrainig = true;
            }
        }
    }
});


async function run(){
    const data = await getData();
    vizualizarDatos(data);
    crearModelo();

    const tensorData = convertirDatosATensores(data);
    const {entradas,etiquetas} = tensorData;
    entrenarModelo


}