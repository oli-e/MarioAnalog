const game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
    preload: preload,
    create: create,
    update: update
})

let score = 0
let scoreText
let backgroundBar
let healthLabel
let platforms
let diamonds
let cursors
let sky
let player

function preload() {
    game.load.image('sky', './assets/sky.png')
    game.load.image('ground', './assets/platform.png')
    game.load.image('diamond', './assets/diamond.png')
    game.load.spritesheet('woof', './assets/woof.png', 32, 32)
    game.load.spritesheet('enemy', 'assets/enemy.png', 32, 48)
    game.load.image('green-bar', './assets/health_green.png');
    game.load.image('red-bar', './assets/health_reg.png');

}

function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE)
    game.world.setBounds(0, 0, 2000, 600);
    sky = game.add.sprite(0, 0, 'sky')
    sky.fixedToCamera = true

    platforms = game.add.group()
    enemiesGroup = game.add.group()
    platforms.enableBody = true
    enemiesGroup.enableBody = true

    const ground = platforms.create(0, game.world.height - 64, 'ground')
        // ENEMIES
    for (var i = 0; i < 5; i++) {
        var enemy = enemiesGroup.create((i + 2) * 500, game.world.height - 150, 'enemy');
        game.physics.arcade.enable(enemy)
        enemy.body.bounce.y = 0.2
        enemy.body.gravity.y = 800
        enemy.anchor.set(0.5, 0.5)
        enemy.body.collideWorldBounds = true

        enemy.animations.add('left', [0, 1, 2, 3], 10, true)
        enemy.animations.add('right', [5, 6, 7, 8], 10, true)
        enemy.body.velocity.x = Math.random() * 50 + 100; // between 100-150
        if (Math.random() < 0.5) enemy.body.velocity.x *= -1; // reverse direction
    }
    ground.scale.setTo(10, 2);

    ground.body.immovable = true
    ground.fixedToCamera = true

    let ledge = platforms.create(400, 450, 'ground')
    ledge.body.immovable = true

    ledge = platforms.create(-75, 350, 'ground')
    ledge.body.immovable = true

    ledge = platforms.create(1370, 400, 'ground')
    ledge.body.immovable = true
    ledge = platforms.create(780, 255, 'ground')
    ledge.body.immovable = true
    ledge.scale.setTo(0.3, 1);

    ledge = platforms.create(650, 355, 'ground')
    ledge.body.immovable = true
    ledge = platforms.create(1000, 200, 'ground')
    ledge.body.immovable = true

    // PLAYER
    player = game.add.sprite(32, game.world.height - 150, 'woof')
    game.camera.follow(player)
    game.physics.arcade.enable(player)
    game.physics.arcade.checkCollision.up = false
    player.health = 90;
    player.maxHealth = 90;
    player.body.bounce.y = 0.2
    player.body.gravity.y = 800
    player.body.collideWorldBounds = true
    player.animations.add('left', [0, 1], 10, true)
    player.animations.add('right', [2, 3], 10, true)

    diamonds = game.add.group()
    diamonds.enableBody = true
    for (var i = 0; i < 120; i++) {
        const diamond = diamonds.create(i * 70, 0, 'diamond')
        diamond.body.gravity.y = 1000
        diamond.body.bounce.y = 0.3 + Math.random() * 0.2
    }

    backgroundBar = game.add.image(350, 20, 'red-bar');
    backgroundBar.fixedToCamera = true;

    healthBar = game.add.image(350, 20, 'green-bar');
    healthBar.fixedToCamera = true;

    healthLabel = game.add.text(250, 20, 'Lifes', { fontSize: '20px', fill: '#ffffff' });
    healthLabel.fixedToCamera = true;
    scoreText = game.add.text(16, 16, '', { fontSize: '32px', fill: '#fff' })
    scoreText.fixedToCamera = true

    cursors = game.input.keyboard.createCursorKeys()
}

function update() {
    player.body.velocity.x = 0

    game.physics.arcade.collide(player, platforms)
    game.physics.arcade.collide(diamonds, platforms)

    game.physics.arcade.overlap(player, diamonds, collectDiamond, null, this)
    game.physics.arcade.overlap(player, enemiesGroup, touchEnemy, null, this);

    enemiesGroup.forEach(function(enemy) {
        game.physics.arcade.collide(enemy, platforms)
        if (enemy.body.velocity.x < 0) {
            enemy.animations.play('left')
            enemy.body.velocity.x = -150;
        } else {
            enemy.animations.play('right');
            enemy.body.velocity.x = 150;
        }
    });
    if (cursors.left.isDown) {
        player.body.velocity.x = -150
        player.animations.play('left')
    } else if (cursors.right.isDown) {
        player.body.velocity.x = 150
        player.animations.play('right')
    } else {
        player.animations.stop()
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -400
    }
    if (score === 300) {
        alert('You win!')
        score = 0
        game.state.restart();

    }
    if (player.health == 0) {
        alert('Game over.')
        game.state.restart()
    }
}

function collectDiamond(player, diamond) {
    diamond.kill()
    score += 10
    scoreText.text = 'Score: ' + score
}

function touchEnemy(player, enemy) {
    enemy.body.velocity.x *= -1;
    player.damage(30)
    healthBar.scale.setTo(player.health / player.maxHealth, 1);
}

function patrolPlatform(enemy, platform) {
    if (enemy.body.velocity.x > 0 && enemy.right > platform.right ||
        enemy.body.velocity.x < 0 && enemy.left < platform.left) {
        enemy.body.velocity.x *= -1;
    }
}
