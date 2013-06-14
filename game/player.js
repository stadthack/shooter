var cp = require('chipmunk');
var v = cp.v;
Player.id = 2;

function Player(position, space) {
  this.health = 100;
  this.id = Player.id;
  Player.id = Player.id+2;
  this.position = position;
  this.space = space;
  this.lastDir = 1;

  this.body = initPlayer(this);

}

var initPlayer = function(context) {
  var body = context.space.addBodyServer(new cp.Body(5, Infinity));
  body.setPos(context.position);
  body['kind'] = 'player';
  var head = context.space.addShape(new cp.CircleShape(body, 5, v(0, 12)));
  var torso = context.space.addShape(new cp.CircleShape(body, 7, v(0, 0)));
  var legs = context.space.addShape(new cp.CircleShape(body, 7, v(0, -14)));
  head.group = context.id;
  torso.group = context.id;
  legs.group = context.id;

  head.collision_type = context.id;
  torso.collision_type = context.id+1;
  legs.collision_type = context.id+1;

  context.space.addCollisionHandler(head.collision_type, 1, null, null, function(e){
    context.space.removeBodyNS(e.body_b);
    e.body_a.player.hit(true)
  }, null);
  context.space.addCollisionHandler(1, head.collision_type, null, null, function(e){
    context.space.removeBodyNS(e.body_a);
    e.body_b.player.hit(true)
  }, null);
  context.space.addCollisionHandler(torso.collision_type, 1, null, null, function(e){
    context.space.removeBodyNS(e.body_b);
    e.body_a.player.hit(false)
  }, null);
  context.space.addCollisionHandler(1, legs.collision_type, null, null, function(e){
    context.space.removeBodyNS(e.body_a);
    e.body_b.player.hit(false)
  }, null);



  body['player'] = context;
  return body;
}

Player.prototype.hit = function(headshot) {
  if(headshot) {
    this.space['remove_shapes'].push(this.body.shapeList[0]);
    this.health = 0;
    this.body.setMoment(1);
  }
  if(this.health === 100) {
    this.health = 50;
  }
  else {
    this.health = 0;
    this.body.setMoment(1);
  }
}

//next step shoot with angle
Player.prototype.shoot = function() {
  var dir = -1;
  if(this.lastDir == 1) {
    dir = 1;
  }
  var bullet = this.space.addBodyServer(new cp.Body(0.1, Infinity));
  bullet.setPos(v(this.body.p.x+10*dir, this.body.p.y));
  bullet['kind'] = 'circle';
  bullet['radius'] = 2;
  var bulletShape = this.space.addShape(new cp.CircleShape(bullet, 2, v(0, 0)));
  bulletShape.collision_type = 1;
  bullet.group = 2;
  bullet.f = v(0, 45);
  bullet.setVelocity(new cp.Vect(500*dir,0));
}

//0=left, 1=right, 2=up
//next step shoot with angle
Player.prototype.move = function(direction) {
  if(direction !==2) {
    this.lastDir = direction;
  }
  //player in the air
  if(this.body.arbiterList === null) {
    if(direction === 2 && Math.abs(this.body.vy) < 350) {
      this.body.applyImpulse(new cp.Vect(0,1000), new cp.Vect(0,0));
    }
    else if(direction === 0 && Math.abs(this.body.vx) < 350) {
      this.body.applyImpulse(new cp.Vect(-500,0), new cp.Vect(0,0));
    }
    else if(direction === 1 && Math.abs(this.body.vx) < 350) {
      this.body.applyImpulse(new cp.Vect(500,0), new cp.Vect(0,0));
    }
  }
  else {
    if(direction === 2) {
      this.body.applyImpulse(new cp.Vect(0,1000), new cp.Vect(0,0));
    }
    else if(direction === 0) {
      this.body.setVelocity(new cp.Vect(-200,0));
    }
    else if(direction === 1) {
      this.body.setVelocity(new cp.Vect(200,0));
    }
  }
}

Player.prototype.keyup = function(e) {
  if(this.body.arbiterList !== null) {
    this.body.setVelocity(new cp.Vect(0,0));
  }
}

exports.Player = Player;