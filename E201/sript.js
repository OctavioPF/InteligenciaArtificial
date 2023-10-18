
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
        callbacks:tfvis.show,fitCallBacks(
        {name:'Training Perfomance'},
        ['loss','mse'],
        {height:200,callbacks:['onEpochEnd']}
    }
    });
}

async function run(){
    const data = await getData();
    vizualizarDatos(data);
    crearModelo();

    const tensorData = convertirDatosATensores(data);
    const {entradas,etiquetas} = tensorData;
    entrenarModelo


}