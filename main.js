const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth;
canvas.height = window.innerHeight; 
const scoreEl = document.getElementById("scroreEl");
const startGame = document.getElementById("startGame");
const tab = document.getElementById("tab");
const points = document.getElementById("points");
//create a player

class Player{
     constructor( x , y , radius , color){
         this.x = x
         this.y = y
         this.radius = radius
         this.color = color
     }

     draw(){
         ctx.beginPath()
         ctx.arc(this.x , this.y , this.radius , 0 , Math.PI * 2 , false )
         ctx.fillStyle = this.color
         ctx.fill()
     }
}
//shoot Projectiles
 
class Projectiles{
    constructor(x , y , radius , color , velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x , this.y , this.radius , 0 , Math.PI * 2 , false)
        ctx.fillStyle = this.color 
        ctx.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y +  this.velocity.y 
    }
}

class Enemies{
    constructor(x , y , radius , color , velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x , this.y , this.radius , 0 , Math.PI * 2 , false)
        ctx.fillStyle = this.color 
        ctx.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y +  this.velocity.y 
    }
}

const friction = 0.98;

class Paticle{
    constructor(x , y , radius , color , velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw(){
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x , this.y , this.radius , 0 , Math.PI * 2 , false)
        ctx.fillStyle = this.color 
        ctx.fill()
        ctx.restore()
    }

    update(){
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y +  this.velocity.y 
        this.alpha -= 0.01 
    }
}


const x = canvas.width / 2
const y = canvas.height / 2
const player = new Player( x , y , 20, '#fff')


let projectiles = new Projectiles(canvas.width / 2, canvas.height / 2 , 5 , 'white' , { x:1 , y:1 } )
let enemy =  new Projectiles(canvas.width / 2, canvas.height / 2 , 5 , 'red' , { x:1 , y:1 } ) 


let projectile = [];
let enemies = [];
let particles = [];

function init(){
   projectiles = new Projectiles(canvas.width / 2, canvas.height / 2 , 5 , 'white' , { x:1 , y:1 } )
   enemy =  new Projectiles(canvas.width / 2, canvas.height / 2 , 5 , 'red' , { x:1 , y:1 } ) 
   projectile = [];
   enemies = [];
   particles = [];
   score = 0;
   scoreEl.innerHTML = score
}

function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (30 - 4) + 4
        let x
        let y 
        if(Math.random() < 0.5){
            x = Math.random() < 0.5 ? 0 - radius :canvas.width + radius;  
            y = Math.random() * canvas.height; 
        }else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius :canvas.height + radius;  
        }
        const color = `hsl(${Math.random() * 360}, 50% , 50%)`;

        const angle = Math.atan2(canvas.height / 2 -y , canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemies( x , y , radius , color , velocity ))
    } , 1000)
}


let animationId;
let score = 0;
function animate(){
    animationId  = requestAnimationFrame(animate)
    ctx.fillStyle = "rgba(109 , 90, 10 , .1)"
    ctx.fillRect(0 , 0 , canvas.width , canvas.height)
    player.draw()
    particles.forEach((particle , index) => {
        if(particle.alpha < 0){
            particles.splice(index , 1)
        }else{
            particle.update();
        }
    })

    projectile.forEach((projectiles , index) => {
        projectiles.update()

        //remove from egde of the screen
        if(projectiles.x + projectiles.radius < 0 || 
            projectiles.x - projectiles.radius > canvas.width || 
            projectiles.y + projectiles.radius < 0 ||
             projectiles.y - projectiles.radius > canvas.height){
            setTimeout(() => {
                projectile.splice(index , 1)
           } , 0 )
        }
    });

    enemies.forEach( (enemy , index) => {
        enemy.update()
        //end game
        const dist = Math.hypot(player.x - enemy.x , player.y - enemy.y)
        if(dist - enemy.radius -player.radius < 1){
            cancelAnimationFrame(animationId);
            tab.style.display = "block"
            points.innerHTML = score;
            updateScore(score);
        }

        projectile.forEach((projectiles , projectilesIndex) => {
            const dist = Math.hypot(projectiles.x - enemy.x , projectiles.y - enemy.y)
            //when projectile touch enemy
            if(dist - enemy.radius -projectiles.radius < 1){
                //increase score
                score += 10
                scoreEl.innerHTML = score

                //create explotion
                for(let i = 0; i < enemy.radius * 2; i++){
                    particles.push(new Paticle(projectiles.x, projectiles.y , Math.random() * 2 , enemy.color , 
                        {
                            x: (Math.random() - 0.5) * (Math.random() * 8) , 
                            y: (Math.random() - 0.5) * (Math.random() * 8)
                        }
                    ))
                }
                if(enemy.radius - 10 > 5){
                    enemy.radius -= 10
                    setTimeout(() => {
                      projectile.splice(projectilesIndex , 1)
                    } , 0)
                }else{
                    setTimeout(() => {
                        enemies.splice(index , 1)
                        projectile.splice(projectilesIndex , 1)
                   } , 0)
                }
            }
        })
    })
}

addEventListener( 'click' , (event) => {
    //console.log(event)
    const angle = Math.atan2(event.clientY - canvas.height / 2 , event.clientX - canvas.width / 2)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    projectile.push(new Projectiles(canvas.width / 2, canvas.height / 2 , 5 , '#fff' , velocity ))
})

startGame.addEventListener('click' , () => {
    init()
    tab.style.display = "none"
    animate()    
    spawnEnemies() 
})


function getCookie(cname){
    let name = cname + "=";
    let decodeCookie = decodeURIComponent(document.cookie)
    let ca = decodeCookie.split(';')
    for(var i = 0; i < ca.length; i++){
        let res = ca[i];
        if(res.indexOf(name) == 0){
            return res.substring(name.lenght, res.length)
        }
    }
    return "";
}

//check if cookie isset
var id = getCookie('Zuka-tracker-id');
function checkCookie(){
    if(id !== ""){    
        let data = localStorage.getItem("myData");
        let res = JSON.parse(data);   
    }
    return;
}

function updateScore(newScore){
    let res = JSON.parse(localStorage.getItem("myData"));
    if(res.id == id){
        console.log(res.id)
    }
}

document.addEventListener('DOMContentLoaded' , () => {
     checkCookie()
})





