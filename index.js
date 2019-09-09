var canvas, context;
var particles=[];
var time = null;
var electricalConstant = 100000;
var radiusInput, massInput, chargeInput, subtitlesCheckbox;
var positive = true;
var mouseLocation;
var r=20;
class Vector{
    constructor(x, y){
        this.x=x;
        this.y=y;
    }
    increase(B){
        this.x+=B.x;
        this.y+=B.y;
    }
    increased(B){
        return new Vector(this.x+B.x, this.y+B.y);
    }
    scale(k){
        this.x*=k;
        this.y*=k;
    }
    scaled(k){
        return new Vector(this.x*k, this.y*k);
    }
    getValue(){
        return Math.sqrt(Math.pow(this.x, 2)+Math.pow(this.y, 2));
    }
    normalize(){
        this.scale(1/this.getValue());
    }
    normalized(){
        return this.scaled(1/this.getValue());
    }
	equals(B){ 
		return B.x==this.x && B.y==this.y;
	}
}
window.onload=function(){
    radiusInput = document.getElementById("radiusInput");
    massInput = document.getElementById("massInput");
    chargeInput = document.getElementById("chargeInput");
	subtitlesCheckbox= document.getElementById("subtitlesCheckbox");
    canvas=document.getElementById("canvas");
    context=canvas.getContext("2d");
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight; 
    context.fillStyle="#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    canvas.addEventListener("click", (e)=>{
       
        r=Number(radiusInput.innerText);
        m=Number(massInput.innerText);
        c=Number(chargeInput.innerText);
        new Particle(new Vector(e.clientX, e.clientY-40), r, m, c);
    });
    God.applyPhysics(10);
	canvas.addEventListener("mousemove", (e)=>{
		mouseLocation = new Vector(e.clientX, e.clientY);
	});
	window.addEventListener("keydown", (e)=>{
		let nr = Number(e.keyCode);
		if(nr>=48 && nr<=57){
			new Particle(new Vector(mouseLocation.x, mouseLocation.y-40), r, (positive?1:-1)*Number(nr-48));
		}
		else if(nr==187){//plus
			 positive=true;
		}
		else if(nr==189){//minus
			positive=false;
		}
		else if(nr==81){//q
			r=10;
		}
		else if(nr==87){//w
			r=20;
		}
		else if(nr==69){//e
			r=30;
		}
		else if(nr==82){//r
			r=40;
		}
	});
};
God={
    time: null,
    applyPhysics: function(chronon){
        this.time=setInterval(()=>{
            for(let a=0; a<particles.length; a++){
                particles[a].acceleration=new Vector(0, 0);
				for(let b=a+1; b<particles.length; b++){
					let A=particles[a];
					let B=particles[b];
					/*console.log(A.location.y);*/
					if(A.location.equals(B.location)) A.location.y-=50;
					//console.log(A.location);
					//console.log(B.location);
				}
            }
            for(let a=0; a<particles.length; a++){
                for(let b=a+1; b<particles.length; b++){
                    let A=particles[a];
                    let B=particles[b];
                    let eForce = electricalConstant*A.charge*B.charge/Math.pow(A.distanceTo(B), 2);
                    let accelerationValueA=eForce/A.mass;
					//console.log(A.location);
                    let accelerationValueB=eForce/B.mass;
                    let vectorAB = new Vector(B.location.x-A.location.x, B.location.y-A.location.y);
					//console.log(A.acceleration);
                    A.acceleration.increase(vectorAB.normalized().scaled(-accelerationValueA));
                    B.acceleration.increase(vectorAB.normalized().scaled(accelerationValueB));
                }
            }
            for(let l=0; l<particles.length; l++){
                particles[l].update(chronon);
            }
            for(let a=0; a<particles.length; a++){
                for(let b=a+1; b<particles.length; b++){
                    let A=particles[a];
                    let B=particles[b];
                    let d=(A.radius+B.radius)-A.distanceTo(B);
                    if(d>0){
                        let vectorAB = new Vector(B.location.x-A.location.x, B.location.y-A.location.y);
                        
                        //A.velocity = new Vector(0, 0);
                        //B.velocity = new Vector(0,0)
                        A.location.increase(vectorAB.normalized().scaled(-d/2));
                        B.location.increase(vectorAB.normalized().scaled(d/2));
                        
                        // x dimension collision A
                        vAx=(A.velocity.x*A.mass+(2*B.velocity.x-A.velocity.x)*B.mass)/(A.mass+B.mass);
                        // y dimension collision A
                        vAy=(A.velocity.y*A.mass+(2*B.velocity.y-A.velocity.y)*B.mass)/(A.mass+B.mass);
                        // x dimension collision B
                        vBx=(B.velocity.x*B.mass+(2*A.velocity.x-B.velocity.x)*A.mass)/(B.mass+A.mass);
                        // y dimension collision B
                        vBy=(B.velocity.y*B.mass+(2*A.velocity.y-B.velocity.y)*A.mass)/(B.mass+A.mass);
                        //settings
                        A.velocity.x=vAx;
                        A.velocity.y=vAy;
                        B.velocity.x=vBx;
                        B.velocity.y=vBy;
                        A.velocity.scale(0.5);
                        B.velocity.scale(0.5);
                    }
                }
            }
            particles = particles.filter((p)=>!(p.location.x+p.radius<0 || p.location.x-p.radius>canvas.width || p.location.y+p.radius<0 || p.location.y-p.radius>canvas.height || Number.isNaN(p.location.x)));
            context.fillStyle="#000";
            context.fillRect(0,0,canvas.width, canvas.height);
            for(let l=0; l<particles.length; l++){
                //console.log(particles[l].location);
                particles[l].update(chronon);
                particles[l].draw();
            }
        }, chronon);
    },
    stopTime: function(){
        clearInterval(this.time);
        this.time=null;
    }
};
class Particle{
    constructor(location, radius, charge){
        this.location=location;
        this.mass=1;
        this.radius=radius;
        this.charge=charge;
        this.velocity=new Vector(0, 0);
        this.acceleration=new Vector(0, 0);
        particles.push(this);
    }
    draw(){
        context.beginPath();
        context.moveTo(this.location.x+this.radius, this.location.y);
        context.arc(this.location.x, this.location.y, this.radius, 0, 2*Math.PI, true);
        if(this.charge>0) context.fillStyle="red";
        else if(this.charge<0) context.fillStyle="#0055FF";
        else context.fillStyle="green";
        context.fill();
		if(subtitlesCheckbox.checked){
			context.font = "15px  Arial";
			context.fillStyle = "#FFF";
			context.textAlign = "center";
			context.fillText(`mass: ${this.mass}\ncharge: ${this.charge>0?"+":""}${this.charge}`, this.location.x+this.radius, this.location.y+this.radius-40);
		}
	}
    distanceTo(B){
        let dx=B.location.x-this.location.x;
        let dy=B.location.y-this.location.y;
        return Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2));
    }
    update(chronon){
        this.velocity.increase(this.acceleration.scaled(chronon/1000));
        this.location.increase(this.velocity.scaled(chronon/1000));
    }
}