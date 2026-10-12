let imgGoccia;
let immaginiForesta = [];
let listaDomande = [];
let rumoreBianco; 
let bling, secchioAcqua, loopGioco, allarme, pop, foglie, popBasso;
let videoFoglie;
let videoCaricato = false;

let stato = 0; // 0 = home, 1 = gioco, 2 = riepilogo
let contatoreDomande = 0; 
let sogliaRettangoli = 12; 
let livelloAcqua = 5; 
let domandeTotaliPartita = 0; 
let velocitaDomande; 
let incrementoVelocita = 0.0022; 
let co2TotalePartita = 0.0; 

let domandaX = []; 
let domandaY = []; 
let domandaTesto = []; 

let inputUtente = ""; 

let pcCentroX, pcCentroY, pcLargh, pcAlt; 
let barraX, barraY, barraLargh, barraAlt, bottoneX; 
let giaSuonatoHover = false; 

function preload() {
  imgGoccia = loadImage("goccia.png");
  
  for (let i = 0; i < 5; i++) {
    immaginiForesta[i] = loadImage("foresta_" + (5 - i) + ".png");
  }
  
  // Caricamento lista domande con fallback di sicurezza se il file non risponde subito
  listaDomande = loadStrings("domande.txt", 
    () => { /* Caricato con successo */ }, 
    () => { listaDomande = ["L'AI inquina?", "Quanto consuma ChatGPT?", "I data center usano acqua?"]; }
  );

  soundFormats('wav', 'mp3');
  bling = loadSound("bling.wav");
  secchioAcqua = loadSound("secchio_acqua.wav");
  loopGioco = loadSound("loop.wav");
  allarme = loadSound("allarme.wav");
  pop = loadSound("pop.wav");
  foglie = loadSound("foglie.wav");
  popBasso = loadSound("pop_basso.wav");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  
  rumoreBianco = new p5.Noise('white');
  rumoreBianco.amp(0.10);
  rumoreBianco.start();
  
  if (loopGioco) loopGioco.setVolume(0.45);
  if (foglie) foglie.setVolume(1.0);

  videoFoglie = createVideo("foglieVideo.mp4", () => {
    videoFoglie.hide();
    videoFoglie.loop();
    videoCaricato = true;
  });

  pcCentroX = width / 2; 
  pcCentroY = height * 0.62; 
  pcLargh = width * 0.35;    
  pcAlt = pcLargh * 0.71; 
  
  barraX = width / 2 - (width * 0.04); 
  barraY = height * 0.22; 
  barraLargh = width * 0.50;
  barraAlt = height * 0.065;
  bottoneX = barraX + (barraLargh / 2.0) + (width * 0.01) + ((barraLargh * 0.16) / 2.0);

  velocitaDomande = height * 0.0035; 
  
  // Inizializzazione sicura delle domande
  setTimeout(() => {
    if (!listaDomande || listaDomande.length === 0) {
      listaDomande = ["L'AI inquina?", "Quanto consuma ChatGPT?", "I data center usano acqua?"];
    }
    inizializzaDomande();
  }, 300);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  pcCentroX = width / 2; 
  pcCentroY = height * 0.62; 
  pcLargh = width * 0.35;    
  pcAlt = pcLargh * 0.71; 
  
  barraX = width / 2 - (width * 0.04); 
  barraY = height * 0.22; 
  barraLargh = width * 0.50;
  barraAlt = height * 0.065;
  bottoneX = barraX + (barraLargh / 2.0) + (width * 0.01) + ((barraLargh * 0.16) / 2.0);
}

function draw() {
  background(255);

  // Stato 0 = Home
  if (stato == 0) {
    disegnaComputer(); 
    noStroke();
    fill(24, 97, 24); 
    textSize(height * 0.045); 
    text("L'AI sa veramente tutto!!!", width / 2, height * 0.12); 
    fill(50, 120, 50); 
    textSize(height * 0.026); 
    text("chiedi, è gratis!", width / 2, barraY - (barraAlt * 0.9)); 
    disegnaBarraRicerca(barraX, barraY, barraLargh, barraAlt);
  }

  // Stato 1 = Gioco
  if (stato == 1) {
    noStroke();
    if (contatoreDomande >= 3) { fill(240, 220, 0, 80); ellipse(pcCentroX, pcCentroY, pcLargh * 2.0, pcLargh * 2.0); } 
    if (contatoreDomande >= 6) { fill(255, 120, 0, 85); ellipse(pcCentroX, pcCentroY, pcLargh * 1.6, pcLargh * 1.6); } 
    if (contatoreDomande >= 9) { fill(250, 0, 0, 90); ellipse(pcCentroX, pcCentroY, pcLargh * 1.2, pcLargh * 1.2); } 

    disegnaComputer(); 
    muoviDomande(); 

    if (livelloAcqua > 0) {
      noStroke();
      fill(24, 97, 24); 
      textSize(height * 0.032); 
      text("continua a chiedere!", width / 2, barraY - (barraAlt * 0.9));
      
      disegnaBarraRicerca(barraX, barraY, barraLargh, barraAlt); 
      
      let limiteAltoBarra = barraY - (barraAlt / 2.0);
      let limiteBassoBarra = pcCentroY + (pcAlt / 2) + (pcAlt * 0.10) + (pcAlt * 0.015); 
      let barraAcquaX = width * 0.93;
      
      imageMode(CENTER); 
      if (imgGoccia) {
        image(imgGoccia, barraAcquaX, limiteAltoBarra - ((height * 0.02) * 1.2), height * 0.04, height * 0.04); 
      }
      disegnaBarraAcqua(barraAcquaX, limiteAltoBarra + ((limiteBassoBarra - limiteAltoBarra) / 2.0), limiteBassoBarra - limiteAltoBarra); 
    } else { 
      // GAME OVER
      noStroke();
      fill(24, 97, 24); 
      rect(width / 2, height * 0.12, width * 0.25, height * 0.07, 10);
      fill(255); 
      textSize(height * 0.028); 
      text("Vedi Riepilogo", width / 2, height * 0.12);
    }
  }

  // Stato 2 = Riepilogo
  if (stato == 2) {
    imageMode(CORNER);
    if (videoCaricato && videoFoglie) {
      image(videoFoglie, 0, 0, width, height);
    }
    
    fill(255, 230); 
    noStroke(); 
    rect(width / 2, height / 2, width * 0.75, height * 0.75, 15); 
    
    noStroke();
    fill(24, 97, 24); 
    textSize(height * 0.038); 
    text("IMPATTO AMBIENTALE DELLA PARTITA", width / 2, height * 0.17);
    
    fill(100, 110, 125); 
    textSize(height * 0.022); 
    text("passa il mouse sui tuoi dati per scoprire i dati del mondo reale", width / 2.0, height * 0.22);
    
    let yDomande = height * 0.36, yQuadrati = height * 0.53;
    let cardDomandeLargh = width * 0.60, cardDomandeAlt = height * 0.10;
    let cardQuadrateLargh = width * 0.275, cardQuadrateAlt = height * 0.18; 
    
    // Blocco domande totali
    let hoverDomande = (mouseX > width / 2 - cardDomandeLargh / 2 && mouseX < width / 2.0 + cardDomandeLargh / 2 && mouseY > yDomande - cardDomandeAlt / 2 && mouseY < yDomande + cardDomandeAlt / 2); 
    stroke(100, 110, 120); 
    strokeWeight(2); 
    fill(hoverDomande ? color(240, 244, 250) : 255); 
    rect(width / 2.0, yDomande, cardDomandeLargh, cardDomandeAlt, 12); 
    
    noStroke();
    fill(50, 60, 70); 
    textSize(height * 0.026);
    text(hoverDomande ? "Nel mondo vengono fatte circa 2,5 miliardi\ndi domande al giorno solo a ChatGPT" : "Domande fatte in questa partita: " + domandeTotaliPartita, width / 2.0, yDomande);
    
    // Blocco acqua
    let xSinistra = (width / 2.0) - (cardQuadrateLargh / 2.0) - (width * 0.02); 
    let hoverAcqua = (mouseX > xSinistra - cardQuadrateLargh / 2.0 && mouseX < xSinistra + cardQuadrateLargh / 2.0 && mouseY > yQuadrati - cardQuadrateAlt / 2.0 && mouseY < yQuadrati + cardQuadrateAlt / 2.0); 
    stroke(0, 100, 220); 
    strokeWeight(2); 
    fill(hoverAcqua ? color(235, 245, 255) : 255); 
    rect(xSinistra, yQuadrati, cardQuadrateLargh, cardQuadrateAlt, 12); 
    
    noStroke();
    if (hoverAcqua) { 
      fill(30, 70, 120); 
      textSize(height * 0.020);
      text("L'United Nations University stima\nl'utilizzo di 12.3 miliardi di acqua al giorno.\n\nI server la fanno evaporare per raffreddare\ni processori durante l'addestramento e l'utilizzo.", xSinistra, yQuadrati);
    } else { 
      fill(0, 100, 220); 
      textSize(height * 0.025); 
      text("Acqua evaporata:\n\n" + nf(domandeTotaliPartita * 0.05, 1, 2) + " Litri", xSinistra, yQuadrati);
    }
    
    // Blocco CO2
    let xDestra = (width / 2.0) + (cardQuadrateLargh / 2.0) + (width * 0.02); 
    let hoverCO2 = (mouseX > xDestra - cardQuadrateLargh / 2.0 && mouseX < xDestra + cardQuadrateLargh / 2.0 && mouseY > yQuadrati - cardQuadrateAlt / 2.0 && mouseY < yQuadrati + cardQuadrateAlt / 2.0); 
    stroke(200, 40, 40); 
    strokeWeight(2); 
    fill(hoverCO2 ? color(255, 240, 240) : 255); 
    rect(xDestra, yQuadrati, cardQuadrateLargh, cardQuadrateAlt, 12); 
    
    noStroke();
    if (hoverCO2) {
      fill(140, 30, 30); 
      textSize(height * 0.020);
      text("Si stima un consumo giornaliero di Co2\ncompreso tra le 90000 e le 219000 tonnellate al giorno.\n\nPer assorbirla tutta servirebbe il lavoro di\n2,3 miliardi di alberi adulti.", xDestra, yQuadrati);
    } else {
      fill(200, 40, 40); 
      textSize(height * 0.025); 
      text("Emissione CO2:\n\n" + nf(co2TotalePartita, 1, 1) + " grammi", xDestra, yQuadrati);
    }
    
    if (hoverDomande || hoverAcqua || hoverCO2) { 
      if (!giaSuonatoHover) { 
        if (popBasso) popBasso.play(); 
        giaSuonatoHover = true; 
      } 
    } else { 
      giaSuonatoHover = false; 
    }
    
    // Tasto Torna alla Home
    fill(24, 97, 24); 
    noStroke(); 
    rect(width / 2.0, height * 0.78, width * 0.22, height * 0.065, 12);
    
    noStroke();
    fill(255); 
    textSize(height * 0.026); 
    text("Torna alla Home", width / 2.0, height * 0.78);
  }
}

function disegnaBarraRicerca(x, y, w, h) {
  stroke(180); 
  strokeWeight(2); 
  fill(255); 
  rect(x, y, w, h, 6); 
  
  fill(24, 97, 24); 
  noStroke(); 
  rect(bottoneX, y, w * 0.16, h, 6); 
  
  noStroke();
  fill(0); 
  textSize(h * 0.35); 
  textAlign(LEFT, CENTER); 
  text(inputUtente + (frameCount % 30 < 15 ? "|" : ""), x - w / 2 + 15, y); 
  
  fill(255);
  textAlign(CENTER, CENTER); 
  text("Invio", bottoneX, y);
}

function disegnaBarraAcqua(x, y, barraAlt) {
  let barraLargh = width * 0.032;
  stroke(0, 100, 255); 
  strokeWeight(3); 
  fill(240); 
  rect(x, y, barraLargh, barraAlt, 8); 
  
  let altezzaFluido = (livelloAcqua / 5.0) * (barraAlt - 6); 
  noStroke(); 
  fill(0, 120, 255); 
  rectMode(CORNER); 
  rect(x - (barraLargh / 2) + 3, (y + barraAlt / 2 - 3) - altezzaFluido, barraLargh - 6, altezzaFluido, 4); 
  rectMode(CENTER); 
}

function disegnaComputer() {
  stroke(110); 
  strokeWeight(pcLargh * 0.025); 
  fill(0); 
  rect(pcCentroX, pcCentroY, pcLargh, pcAlt, 8); 
  
  if (stato == 1) {
    let indice = constrain(livelloAcqua - 1, 0, 4); 
    if (immaginiForesta[indice]) { 
      imageMode(CENTER); 
      image(immaginiForesta[indice], pcCentroX, pcCentroY, pcLargh - (pcLargh * 0.025), pcAlt - (pcLargh * 0.025)); 
    }
    if (livelloAcqua == 0) { 
      fill(0, 190); 
      noStroke();
      rect(pcCentroX, pcCentroY, pcLargh - (pcLargh * 0.025), pcAlt - (pcLargh * 0.025)); 
      
      fill(250, 0, 0); 
      textSize(pcLargh * 0.065); 
      text("SISTEMA COLLASSATO\nRISORSE ESAURITE", pcCentroX, pcCentroY);
    }
  }
  fill(160); 
  stroke(110); 
  strokeWeight((pcLargh * 0.025) * 0.5); 
  rect(pcCentroX, pcCentroY + (pcAlt / 2) + (pcAlt * 0.04), pcLargh * 0.15, pcAlt * 0.08); 
  rect(pcCentroX, pcCentroY + (pcAlt / 2) + (pcAlt * 0.10), pcLargh * 0.40, pcAlt * 0.03); 
}

function inizializzaDomande() {
  if (!listaDomande || listaDomande.length === 0) {
    listaDomande = ["Domanda di riserva 1", "Domanda di riserva 2"];
  }
  for (let i = 0; i < 5; i++) {
    domandaX[i] = random(width * 0.28, width * 0.72); 
    domandaY[i] = random(-height * 0.4, -height * 0.05); 
    let rIdx = int(random(listaDomande.length));
    domandaTesto[i] = listaDomande[rIdx]; 
  }
}

function muoviDomande() {
  textSize(height * 0.024);
  for (let i = 0; i < 5; i++) {
    if (!domandaTesto[i]) continue;
    let rectLargh = textWidth(domandaTesto[i]) + (width * 0.02); 
    fill(230, 230, 235);
    noStroke();
    rect(domandaX[i], domandaY[i], rectLargh, height * 0.05, 10); 
    
    noStroke();
    fill(0); 
    text(domandaTesto[i], domandaX[i], domandaY[i]);
   
    domandaY[i] += velocitaDomande; 
    if (domandaX[i] < pcCentroX) domandaX[i] += (width * 0.0004);
    if (domandaX[i] > pcCentroX) domandaX[i] -= (width * 0.0004);
    
    let toccaX = (domandaX[i] + (rectLargh / 2) > pcCentroX - (pcLargh / 2)) && (domandaX[i] - (rectLargh / 2) < pcCentroX + (pcLargh / 2)); 
    let toccaY = (domandaY[i] + 13.5 > pcCentroY - (pcAlt / 2)) && (domandaY[i] - 13.5 < pcCentroY + (pcAlt / 2)); 
    let cadutaFuori = (domandaY[i] - 13.5 > pcCentroY + (pcAlt / 2) + (height * 0.03)); 

    if ((toccaX && toccaY) || cadutaFuori) {
      if (toccaX && toccaY) if (pop) pop.play(); 
      domandeTotaliPartita++; 
      co2TotalePartita += 2.24; 
      
      if (livelloAcqua > 0) {
        contatoreDomande++;
        if (contatoreDomande >= sogliaRettangoli) { 
          livelloAcqua--;
          if (secchioAcqua) secchioAcqua.play(); 
          
          velocitaDomande += (height * incrementoVelocita);
          
          contatoreDomande = 0; 
          if (livelloAcqua == 0) { 
            if (loopGioco) loopGioco.stop(); 
            if (allarme) allarme.loop(); 
          }
        }
      }
      domandaY[i] = random(-height * 0.05, -height * 0.03);
      domandaX[i] = random(width * 0.28, width * 0.72);
      if (listaDomande && listaDomande.length > 0) {
        domandaTesto[i] = listaDomande[int(random(listaDomande.length))]; 
      }
    } 
  }
}

function immettiDomandaUtente() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  if (inputUtente.trim().length > 0) { 
    if (bling) bling.play(); 
   
    let nuovaFrase = inputUtente.trim(); 
    if (!listaDomande) listaDomande = [];
    listaDomande.push(nuovaFrase); 
    
    let sostituita = 0; 
    domandaTesto[sostituita] = nuovaFrase; 
    domandaY[sostituita] = -height * 0.04; 
    domandaX[sostituita] = random(width * 0.38, width * 0.62);
    
    inputUtente = ""; 

    if (stato == 0) { 
      if (rumoreBianco) rumoreBianco.stop(); 
      if (loopGioco) loopGioco.loop(); 
      stato = 1; 
    }
  }
}

function keyPressed() {
  if (stato == 0 || (stato == 1 && livelloAcqua > 0)) { 
    if (keyCode === ENTER || keyCode === RETURN) {
      immettiDomandaUtente(); 
    } else if (keyCode === BACKSPACE) { 
      if (inputUtente.length > 0) inputUtente = inputUtente.substring(0, inputUtente.length - 1); 
    } else {
      if (key.length === 1 && key !== '\n' && key !== '\r' && key !== '\t') {
        if (inputUtente.length < 50) inputUtente += key; 
      }
    }
  }
}

function mousePressed() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  if (stato == 0) { 
    if (mouseX > bottoneX - (barraLargh * 0.16) / 2 && mouseX < bottoneX + (barraLargh * 0.16) / 2 && mouseY > barraY - barraAlt / 2 && mouseY < barraY + barraAlt / 2) {
      immettiDomandaUtente(); 
    }
  } else if (stato == 1) {
    if (livelloAcqua == 0) { 
      if (mouseX > width / 2 - (width * 0.125) && mouseX < width / 2 + (width * 0.125) && mouseY > (height * 0.12) - (height * 0.035) && mouseY < (height * 0.12) + (height * 0.035)) { 
        if (allarme) allarme.stop(); 
        if (videoFoglie) videoFoglie.loop(); 
        if (foglie) foglie.loop(); 
        stato = 2; 
        giaSuonatoHover = false; 
      }
    } else { 
      if (mouseX > bottoneX - (barraLargh * 0.16) / 2 && mouseX < bottoneX + (barraLargh * 0.16) / 2 && mouseY > barraY - barraAlt / 2 && mouseY < barraY + barraAlt / 2) {
        immettiDomandaUtente(); 
      }
    }
  } else if (stato == 2) { 
    if (mouseX > width / 2 - (width * 0.11) && mouseX < width / 2 + (width * 0.11) && mouseY > (height * 0.78) - (height * 0.032) && mouseY < (height * 0.78) + (height * 0.032)) { 
      if (foglie) foglie.stop(); 
      if (videoFoglie) videoFoglie.stop(); 
      if (rumoreBianco) rumoreBianco.start(); 
      
      stato = 0; 
      livelloAcqua = 5; 
      contatoreDomande = 0; 
      domandeTotaliPartita = 0; 
      inputUtente = ""; 
      co2TotalePartita = 0.0;
      velocitaDomande = height * 0.0035; 
      if (listaDomande && listaDomande.length > 0) {
        inizializzaDomande();
      }
    }
  }
}