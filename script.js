let reqId; // Variável para armazenar o ID do requestAnimationFrame e permitir a parada

// Altera o texto inicial do botão original ("Start") para "Iniciar" ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    const btnStart = document.querySelector("button");
    if (btnStart) {
        btnStart.innerText = "Iniciar";
    }
});

init = async function() {
    const btn = document.querySelector("button");
    if(btn) {
        btn.disabled = true;
        btn.innerText = "Carregando Câmera...";
    }

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = false;
    webcam = new tmImage.Webcam(250, 250, flip);

    await webcam.setup({ facingMode: "environment" });
    await webcam.play();
    
    // Salva o ID da animação para poder interromper depois
    reqId = window.requestAnimationFrame(loop);

    const webcamContainer = document.getElementById("webcam-container");
    webcamContainer.innerHTML = "";
    webcamContainer.appendChild(webcam.canvas);
    webcamContainer.style.display = "block"; // Garante que o contêiner volte a aparecer

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    if(btn) btn.style.display = "none";
    
    // Cria o botão "Sair" dinamicamente se ele ainda não existir no DOM (Document Object Model)
    let btnStop = document.getElementById("btn-stop");
    if (!btnStop) {
        btnStop = document.createElement("button");
        btnStop.id = "btn-stop";
        btnStop.innerText = "Sair";
        btnStop.className = "btn-sair"; // Aplica o CSS (Cascading Style Sheets) vermelho
        btnStop.onclick = stopCamera;
        btn.parentNode.insertBefore(btnStop, btn.nextSibling);
    }
    btnStop.style.display = "block";

    const divs = document.querySelectorAll("div");
    if(divs.length > 0 && divs[0].innerText === "Teachable Machine Image Model") {
        divs[0].style.display = "none";
    }
};

loop = async function() {
    webcam.update();
    await predict();
    reqId = window.requestAnimationFrame(loop);
};

predict = async function() {
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const percent = (prediction[i].probability * 100).toFixed(2);
        const classPrediction = `<span>${prediction[i].className}</span> <span>${percent}%</span>`;
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
};

// Nova função que interrompe a câmera e reseta a interface
stopCamera = function() {
    if (webcam) {
        webcam.stop(); // Desliga o feed de vídeo da câmera traseira
    }
    window.cancelAnimationFrame(reqId); // Para o loop contínuo de atualizações

    // Esconde a câmera e limpa as porcentagens
    document.getElementById("webcam-container").style.display = "none";
    document.getElementById("label-container").innerHTML = "";

    // Esconde o botão de Sair
    const btnStop = document.getElementById("btn-stop");
    if (btnStop) btnStop.style.display = "none";

    // Restaura o botão Iniciar
    const btnStart = document.querySelector("button");
    if (btnStart) {
        btnStart.style.display = "block";
        btnStart.disabled = false;
        btnStart.innerText = "Iniciar";
    }
};