var canvas;            //réference à canvas
var context;           //réference à canvasContext
var brickFactory;      //réference à BrickFactory object
var gun                //réference à Gun object
var collisionDetector  //réference à collision detector
var target             //réference à the Target
var gameLevel = 1;     //niveau du jeu
var backgroundColors = ["white","black","lightgrey"]
var brickColors = ["red","red","blue"]
var gunColors = ["black","black", "red"]
var bulletColors = ["black","green", "red"]

//le tableau d'images d'arrière-plan pour la toile, cela changera en fonction du niveau
var bgImages = [
                 "http://1.bp.blogspot.com/-nUTEBtVnKcE/T2WRZ5QZG5I/AAAAAAAAANs/bsEUeJ2I2Pg/s1600/Desert+Background.jpg",
                 "http://content.chupamobile.com/user-upload2/product-image-screenshot/Kt9JZSjh84SuZQtOptFd3xQj_3_bg3.png",
                 "http://bestgameswallpapers.com/wp-content/uploads/2014/09/game-backgrounds-oe1u6nhl.jpg"
               ]




/**
 * Cela agira comme une classe "Brick"
 * Un objet de cette classe représente une brique sur la toile
 * @param x => Position x de départ de la brique
 * @param y => Position y de départ de la brique
 * @param brickWidth
 * @param brickHeight
 * @param brickColor
 * @constructor
 */
function Brick(x, y, brickWidth, brickHeight, brickColor){
    var xPosition = x;
    var yPosition = y;
    var width = brickWidth;
    var height = brickHeight;
    var color = brickColor;
    var onCanvas = true        //Pour indiquer si la brique est présente ou pas sur la toile
    var destroyed = false

    //Cette fonction fait avancer la brique et qui met à jour la position x de la brique
    this.moveBrick = function(){
        xPosition += width + 2;                          //pour espacer les briques horizontalement

        //Vérifier si la brique est à l'intérieur ou non
        if(xPosition > canvas.width){
            //si c'est en dehors de la toile, elle n'est plus visible
            //Pour la faire supprimer de la liste des briques
            onCanvas = false;
        }
    }

    //cette fonction fera disparaître la brique quand une balle la touche
    this.destroyBrick = function () {
        context.clearRect ( xPosition, y , width, height);
    }

    //cette fonction effacera la brique de la toile
    this.clearBrick = function(){
        context.clearRect ( xPosition-width-2 , y , width, height);
    }

    //Cette fonction dessinera la brique sur la toile
    this.drawBrick = function(){
        context.fillStyle = brickColor;
        context.fillRect(xPosition, yPosition, width, height);
    }

    //Pour que la brique semble réellement en mouvement, nous devons la supprimer de sa position précédente sur la toile et la dessiner à nouveau à sa nouvelle position
    this.reDrawBrick = function(){
        this.clearBrick()
        this.drawBrick()
    }

    //Pour que la brique soit marqué comme hors de la toile
    this.markOutOfCanvas = function(outOfCanvas){
        onCanvas = outOfCanvas;
    }


    //--fonction getters--

    this.getX = function () {
        return xPosition;
    }

    this.getY = function () {
        return yPosition;
    }

    this.getWidth = function () {
        return width;
    }

    this.getHeight = function () {
        return height;
    }

    this.isOnCanvas = function(){
        return onCanvas;
    }
}


/**
 * Un seul objet de cette classe est suffisant pour configurer la BrickFactory pour le jeu de tir
 *  on a donc des informations sur les briques qu'elle va fabriquer
 * @param rows => Nombre de rangées horizontales qui se déplaceront dans le jeu
 * @param width => largeur d'une brique
 * @param height => hauteur d'une brique
 * @param color => couleur d'une brique
 * @constructor
 */
function BrickFactory(rows, width, height, color){
    var horizontalRowCount = rows;
    var brickWidth = width;
    var brickHeight = height;
    var brickColor = color;
    var bricksRemaining = 50 + gameLevel * 50
    var activeBricks = new Array();

    //Pour créer des piles de briques
    this.createBrickPile = function(){
        var x = 0, y = 0;
        for(var i=0; i<horizontalRowCount; i++){
            var rand = Math.floor((Math.random() * 500) + 1);
            if(rand%2==0 && bricksRemaining>0) {
                var newBrick = new Brick(x, y, brickWidth, brickHeight, color);
                activeBricks.push(newBrick);
                bricksRemaining--
            }
            y += brickHeight + 2;            //pour espacer les briques verticalement
        }
    }

    //Pour faire avancer les piles de briques
    this.moveBrickPile = function(){
        for(var i=0; i<activeBricks.length; i++){
            activeBricks[i].moveBrick()
        }
    }

    //cette fonction supprimera les briques qui sont hors de la toile
    this.removeOutOfCanvasBricks = function(){
        for(var i=0; i<activeBricks.length; i++){
            if(!activeBricks[i].isOnCanvas()){
               activeBricks.splice(i,1);
            }
        }
    }

    //cette fonction redessine chaque brique sur la toile
    this.reDrawBricks = function(){
        for(var i=0; i<activeBricks.length; i++){
           activeBricks[i].reDrawBrick();
        }
    }

    //Cette fonction produit une nouvelle pile de briques sur la toile
    // en faisant d'abord de l'espace sur le côté gauche en supprimant la
    // pile sur le côté droit, puis création d'une nouvelle pile sur le côté gauche
    this.startFactory = function(){
        this.removeOutOfCanvasBricks()
        this.moveBrickPile()

        if(bricksRemaining>0) {
            this.createBrickPile()
        }

        this.reDrawBricks()
    }

    //--fonction getter--
    this.getActiveBricks = function () {
        return activeBricks
    }

    this.getBricksRemainingCount = function(){
        return bricksRemaining
    }
}


/**
 * Un objet de cette classe représente une balle
 * @param xStart  => Coordonnée X de la balle à la position de départ
 * @param yStart  => Coordonnée Y de la balle à la position de départ
 * @param bulletColor
 * @param bulletRadius
 * @param bulletSpeed
 * @constructor
 */
function Bullet(xStart, yStart, bulletColor, bulletRadius, bulletSpeed){
    var color = bulletColor;
    var radius = bulletRadius;
    var xPosition = xStart;
    var yPosition = yStart;
    var speed = bulletSpeed;
    var onCanvas = true             //Pour indiquer si la balle est actuellement présente sur la toile ou pas
    var destroyed = false

    //Cette fonction dessinera la balle sur la toile
    this.drawBullet = function(){
        context.fillStyle = color;
        context.beginPath();
        context.arc(xPosition,yPosition,radius,0,2*Math.PI);
        context.fill();
    }

    //Cette fonction fait avancer la balle, en mettant à jour la position y, du centre, de la balle
    this.moveBullet  = function(){
        yPosition -= speed
        if(yPosition<-radius){
            onCanvas = false
        }
    }

    //cette fonction détruit la balle utilisée
    this.destroyBullet = function(){
        context.clearRect ( xPosition-radius , yPosition-radius , radius*2, radius*2);
    }

    //cette fonction effacera la balle de la toile
    this.clearBullet = function(){
        context.clearRect ( xPosition-radius , yPosition+speed-radius , radius*2, radius*2);
    }

    //Pour que la balle semble réellement en mouvement, nous effaçons
    //sa position précédente sur le canevas et nous dessinons
    // à nouveau à sa nouvelle position
    this.reDrawBullet = function(){
        this.clearBullet()
        this.drawBullet()
    }

    //--fonction getter--
    this.isOnCanvas = function(){
        return onCanvas;
    }

    this.markOutOfCanvas = function(outOfCanvas){
        onCanvas = outOfCanvas;
    }

    this.getX = function(){
        return xPosition;
    }

    this.getY = function(){
        return yPosition;
    }

    this.getRadius = function(){
        return radius;
    }
}


/**
 * Un objet de cette classe représente un Gun sur les toiles
 * @param gColor  => Couleur du Gun
 * @param bColor  => Couleur des balles
 * @param bRadius => rayon des balles
 * @param bSpeed  => vitesse de la balle
 * @constructor
 */
function Gun(gColor, bColor, bRadius, bSpeed){
    var gunColor = gColor;
    var gunHeadPositionX = canvas.width/2
    var gunHeadPositionY = canvas.height-90
    var bulletColor = bColor;
    var bulletRadius = bRadius;
    var bulletSpeed = bSpeed;
    var bulletsRemaining = 100 + gameLevel * 50
    var activeBullets = new Array();

    //Cette fonction dessinera le Gun sur la toile
    this.drawGun = function() {
        context.fillStyle = gunColor;
//        context.moveTo(gunHeadPositionX-20, gunHeadPositionY+70);
//        context.lineTo(gunHeadPositionX-20, gunHeadPositionY+30);
//        context.lineTo(gunHeadPositionX, gunHeadPositionY);
//        context.lineTo(gunHeadPositionX+20, gunHeadPositionY+30);
//        context.lineTo(gunHeadPositionX+20, gunHeadPositionY+70);
//        context.closePath();

        context.fillRect(gunHeadPositionX-30, gunHeadPositionY+70, 60, 20);
        context.beginPath();
        context.arc(gunHeadPositionX,gunHeadPositionY+70, 30, 0, Math.PI, true);
        context.fill();


        context.fillRect(gunHeadPositionX-7, gunHeadPositionY, 14, 42);
    }

    //cette fonction déclenchera une nouvelle balle
    this.shoot = function(){
        if(bulletsRemaining > 0) {
            bulletsRemaining--;  //diminuer le nombre de balles
            this.displayBulletsRemaining()
            this.createBullet()
        }
    }

    this.displayBulletsRemaining = function(){
        document.getElementById("remaining-bullets").innerHTML = "BULLETS : " + bulletsRemaining
    }

    //Pour créer une nouvelle balle et la mettre sur la toile
    this.createBullet = function(){
        var x = gunHeadPositionX;
        var y = gunHeadPositionY - 2;
        var newBullet = new Bullet(x, y, bulletColor, bulletRadius, bulletSpeed);
        activeBullets.push(newBullet);
    }

    //Pour faire avancer toutes les balles actives
    this.moveBullets = function(){
        for(var i=0; i<activeBullets.length; i++){
            activeBullets[i].moveBullet()
        }
    }

    //cette fonction supprimera les balles qui sont hors de la toile
    this.removeOutOfCanvasBullets = function(){
        for(var i=0; i<activeBullets.length; i++){
            if(!activeBullets[i].isOnCanvas()){
                activeBullets.splice(i,1);
            }
        }
    }

    //Cette fonction redessine chaque balle sur la toile
    this.reDrawBullets = function(){
        for(var i=0; i<activeBullets.length; i++){
            activeBullets[i].reDrawBullet();
        }
    }

    //cette fonction traduira les balles actives sur la toile vers les briques
    this.translateBullets = function(){
        this.removeOutOfCanvasBullets()
        this.moveBullets()
        this.reDrawBullets()
    }

    //--fonction getter--
    this.getActiveBullets = function () {
        return activeBullets
    }

    this.getBulletsRemainingCount = function(){
        return bulletsRemaining
    }
}


/**
 *Le détecteur de collision vérifiera si une collision s'est produite ou non
 * si une collision s'est produite, elle détruira la brique ainsi que la
 * balle qui est entrée en collision et augmentera le compteur de collisions de 1
 * @constructor
 */
function CollisionDetector(){

    var collisionCount  = 0   //nombre total de collision

    //Cette fonction détectera si la première balle sur le chemin est entrée en collision
    // encore ou pas avec une brique
    this.detectCollision = function(){
        var activeBullets = gun.getActiveBullets()

        //Pour obtenir les coordonnées centrales et le rayon de la première balle sur le chemin des briques
        var centerXBullet = activeBullets[0].getX();
        var centerYBullet = activeBullets[0].getY();
        var bulletRadius = activeBullets[0].getRadius();

        //répéter sur l'ensemble des briques de la toile et trouver à quelle brique la balle va entrer en collision
        var activeBricks = brickFactory.getActiveBricks();
        for(var i=0; i<activeBricks.length; i++){

            //obtenir les coordonnées x et y du coin supérieur gauche de la brique
            var x = activeBricks[i].getX()
            var y = activeBricks[i].getY()
            var width = activeBricks[i].getWidth()
            var height = activeBricks[i].getHeight()

            //vérifier la collision
            if(centerYBullet-bulletRadius <= y+height && centerXBullet>=x && centerXBullet<=x+width){
                //détruire la balle ainsi que la brique après une collision
                activeBricks[i].markOutOfCanvas(false)
                activeBricks[i].destroyBrick()
                activeBricks.splice(i,1)

                activeBullets[0].markOutOfCanvas(false);
                activeBullets[0].destroyBullet()
                activeBullets.splice(0,1);

                collisionCount++;
                this.displayScore()
                break;
            }
        }
    }

    //--fonction getter--
    this.getCollisionCount = function(){
        return collisionCount
    }

    this.displayScore = function(){
        document.getElementById("hits").innerHTML = "SCORE : " + collisionCount
    }
}


/**
 * Cette fonction spécifie le nombre total de briques à détruire par le joueur pour traverser le niveau
 * @constructor
 */
function Target(target){
    var targetScore = target;

    //Obtenir la cible
    this.getTarget = function(){
        return targetScore
    }

    this.displayTarget = function(){
        document.getElementById("target").innerHTML = "TARGET : " + targetScore
    }
}



//main
function runGameLoop(){

    //Pour queles briques continuent de se déplacer sur la toile
    var brickProductionThread = setInterval(function () {
                                    brickFactory.startFactory()
                                }, 1200-200*gameLevel);

    //Pour que les balles continuent à déplacer et à tirer
    var bulletFiringThread =  setInterval(function () {
                                  gun.translateBullets()
                              }, 1000/60);

    //Pour détecter la collision de briques et de balles
    var collisionDetectorThread = setInterval(function(){
                                      var activeBullets = gun.getActiveBullets()
                                      if(activeBullets.length>0) {
                                          collisionDetector.detectCollision()
                                      }
                                  },10);

    //Pour vérifier si l'objectif a été atteint ou non
    // Si le Gun est à court de balles avant que l'objectif soit atteint
    // et si cela se produit, le jeu se termine
    var gameFinisherThread = setInterval(function(){
                                 if(target.getTarget()!=0 && target.getTarget()==collisionDetector.getCollisionCount()){
                                     clearInterval(brickProductionThread);
                                     clearInterval(bulletFiringThread);
                                     clearInterval(collisionDetectorThread);
                                     clearInterval(gameFinisherThread);

                                     gameLevel++

                                     if(gameLevel==6){
                                         alert("Congratulations!! You have cleared all the Rounds of this Game");
                                         alert("START AGAIN");
                                         gameLevel=1
                                     }
                                     else{
                                         alert("Congratulations!! See you in next level");
                                     }

                                     triggerGame()
                                 }
                                 else if(gun.getActiveBullets().length==0 && gun.getBulletsRemainingCount()==0 ||
                                         brickFactory.getActiveBricks().length==0 && brickFactory.getBricksRemainingCount()==0){
                                     clearInterval(brickProductionThread);
                                     clearInterval(bulletFiringThread);
                                     clearInterval(collisionDetectorThread);
                                     clearInterval(gameFinisherThread);
                                     alert("GAME OVER !! START AGAIN");
                                     gameLevel = 1
                                     triggerGame()
                                 }
                             },10);
}


//initialisation
function initialiseGameEngine(){

    document.getElementById("game-level").innerHTML = "LEVEL - " + gameLevel

    //initialiser la toile
    canvas = document.getElementById("arenaCanvas");

    //définir le thème des couleurs selon le niveau
    var index = gameLevel%3 - 1
    if(index==-1) {
        index = 2
    }

    var canvasBG = backgroundColors[index]
    canvas.style.backgroundColor = canvasBG
    canvas.style.backgroundImage = "url('" + bgImages[index] + "')"
    var brickColor = brickColors[index]
    var gunColor = gunColors[index]
    var bulletColor = bulletColors[index]


    //initialiser le contexte de la toile
    context = canvas.getContext("2d");

    //définir une image d'arrière-plan dans la toile
    context.strokeStyle = '#f00';
    context.lineWidth   = 6;
    context.lineJoin    = 'round';
    context.strokeRect(140,60,40,40);
    var img = document.getElementsByTagName('img')[0];
    img.src = canvas.toDataURL();


    context.clearRect(0,0,canvas.width,canvas.height);


    //mettre en place une usine de briques
    // premier argument => nombre de rangées de briques
    // deuxième argument => largeur de brique
    // troisième argument => hauteur de brique
    // quatrième argument => couleur de la brique
    brickFactory = new BrickFactory(3,canvas.width/26, 30, brickColor);


    //faire un Gun
    // premier argument => couleur du pistolet
    // second arg => couleur des balles
    // troisième argument => rayon des balles
    // quatrième argument => vitesse des balles
    gun = new Gun(gunColor, bulletColor, 7, 8)
    gun.displayBulletsRemaining()

    //initialiser le détecteur de collision
    collisionDetector = new CollisionDetector()
    collisionDetector.displayScore()

    //fixer la cible pour le joueur
    target = new Target(gameLevel*30)
    target.displayTarget()

    //dessiner le Gun sur la toile
    gun.drawGun()
}



function triggerGame(){
    initialiseGameEngine()
    runGameLoop()
}