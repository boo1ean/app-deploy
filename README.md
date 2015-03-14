## app-deploy

Thrifty incremental deploys.

Rough algorithm description:

1. Figure out which files were changed since last deploy (through `git diff`).
2. Figure out which tasks should be executed.
3. Execute tasks.

## Installation

```
npm install -g app-deploy
```

## Usage

Deploy app to production:

```
ad deploy production
```

Looks nice but first you need to configure!

## Initial notices

`app-deploy` is dedicated to do incremental deploy of already running app/service, first time you
should setup and run your application manually.

It's not dedicated to deploy "new app instances".

## Triggers deploy config

Triggers config must be located in project root (and must be named `app-deploy.json`).
It consists of simple rules and triggers which are used to figure out how to deploy app.

Sample config describes conditions and triggers for `app-deploy` cli util:

```js
{
	"triggers": {
		// if bower.json was changed since last deploy then execute "bower install"
		"bower.json"   : "bower intall",

		// if bower.json was changed since last deploy then execute "npm install"
		"package.json" : "npm intall",

		// if there are any changed or added fiels matching database/** globa pattern
		// then execute "knex migrate:latest"
		"database/**"  : "knex migrate:latest",

		// if any local dependency which are required by any file under web/**
		// were changed then execute "pm2 restart all"
		"+web": "pm2 restart all"
	}
}
```

Each "trigger" consits of condition (glob or requires matching pattern) and shell command   
which will be executed if condition is true (if files diff since last deploy matches condition pattern)

## Add remote server (for remote deploy)

Add remote:

```
ad remote add <remote name> <ssh connection string> [--env]
```

Example adding `my-localhost-server` remote:

```
ad remote add my-localhost-server root@127.0.0.1:/var/www/application --env="override_some_stuff=123"
```

To work with remote deploys you must configure key-based ssh auth to work from your local machine to remote server.   
[How To Configure SSH Key-Based Authentication on a Linux Server](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server)

Now we are ready to deploy!

```
ad deploy my-localhost-server
```

## License
MIT
