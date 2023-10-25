let net;

const imgEl = document.getElementById('img');
const descEl = document.getElementById('descripcion_imagen');

imgEl.onload = async function(){
    displayImagePrediction();
}

async function displayImagePrediction(){
    try {
        result = await net.classfy(imgEl);
        descEl.innerHTML = JSON.stringify(result);
    } catch (error) {
        
    }
}
count = 0;
async function cambiarImagen() {
    count=count+1;
    imgEl.src = "https://picsum.phots/200/300?random="+count;
}

async function app() {
    net = await mobilenet.load();

    var result = await net.classfy(imgEl);
    console.log(result);
    displayImagePrediction();
}

app();