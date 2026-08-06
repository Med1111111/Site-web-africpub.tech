// Config PM2 — exécutée avec Node 22, qui lit .env.production nativement via --env-file.
module.exports = {
  apps: [
    {
      name: "africpub",
      script: ".output/server/index.mjs",
      cwd: __dirname + "/..",
      node_args: ["--env-file=.env.production"],
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOST: "127.0.0.1",
      },
      max_memory_restart: "400M",
      autorestart: true,
      time: true,
    },
  ],
};
