---
title: A guide to hosting rust
preview: false
author: Wakunguma Kalimukwa
synopsis: Dozens of services, only one app
image: /internal/thumbnails/hosting-rust.png
imageAsset: ../assets/internal/thumbnails/hosting-rust.png
imageSize: 12
published: 2025-05-23
tags:
  - Backend
  - Rust
---
In 2025 there's a plethora of ways to host a rust app/server. Sometimes figuring out which services to use can be more complex than actually building the app itself. So this guide will try to cover all the common ways and list the pros and cons. All the information is written at the time of publishing and is subject to change.
## Virtual machines
A virtual machine is an isolated computing environment, created by software on a physical server.
Typically, virtual machines are controlled via SSH; you connect to the VM via SSH, clone your repository, install dependencies, and run your application. Since rust is so lightweight you get a long way with fewer resources if you configure things right. Among the most popular providers are:
- [Amazon EC2](https://aws.amazon.com/pm/ec2/)
- [DigitalOcean Droplets](https://www.digitalocean.com/products/droplets)
- [GCP Compute Engine](https://cloud.google.com/products/compute?hl=en)
- [Azure Virtual Machines](https://azure.microsoft.com/en-ca/products/virtual-machines/)

There isn't much of a difference between the virtual machines themselves, it's more of a difference between the platforms: their pricing, developer experience and documentation.

Let's take DigitalOcean Droplets as an example. We'll use [`doctl`](https://docs.digitalocean.com/reference/doctl/how-to/install/), the official CLI, to create and configure our droplet.

```bash
doctl compute droplet create my-droplet \ 
--size s-1vcpu-512mb-10gb \
--image ubuntu-20-04-x64 \ 
--region nyc1 \
--enable-ipv6 \
--project-id [PROJECT_ID] 
```
This will create an ubuntu image with 512 Megabytes of RAM and 10 Gigabytes, this specific droplet will cost $4.00 a month, if you need more storage you can attach a volume.

We can now SSH into the droplet using OpenSSH or Putty, using the temporary password.

```bash
ssh root@122.232.123.2
```

You'll immediately be required to change the password to something different before proceeding. After that we now have full access to our VM.

```bash
root@my-droplet:~#
```
Now you would set up rust and any other dependencies, clone your repository and run the application. Virtual machines are great and cheap, but they can be a lot of maintenance, especially if you need multiple services, consider using Terraform or Pulumi if you plan to frequently use virtual machines.
## Platform as a service
A Platform as a Service (PaaS) abstracts the underlying details of the device and lets you simply deploy your code, usually as a container, to some managed, auto-scaling machine in the cloud. Most services use Docker, the typical rust Dockerfile looks something like this:

```dockerfile
FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# Build and cache dependencies
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release

# Final image with just our binary
FROM debian:bookworm-slim as runner
WORKDIR /app
COPY --from=builder /app/target/release/app /usr/local/bin
ENTRYPOINT ["/usr/local/bin/app"]
```

### Google Cloud Run
[Google Cloud Run](https://cloud.google.com/run?hl=en) is a fully managed application platform that allows you to deploy container images as services. A service is a long lived program which listens and responds to incoming requests. Services are auto scaling and can scale to 0 when not being used, the minimum number of instances can be set to something like `1` to always keep at least one instance on and prevent cold starts. 

First we need to create a repository to upload our image to.

```bash
gcloud artifacts repositories create my-repo \
--location=us-east1 \
--repository-format=docker
```

Now we can tag and push our image to the repo.

```bash
docker tag backend us-east1-docker.pkg.dev/[PROJECT_ID]/my-repo/backend

docker push us-east1-docker.pkg.dev/[PROJECT_ID]/my-repo/backend
```

Image tags need to be in a specific format: `[REGION]-docker.pkg.dev/[PROJECT_ID]/[REPO]/[IMAGE]`. And now we can deploy to cloud run

```bash
gcloud run deploy backend \ 
--image us-east1-docker.pkg.dev/[PROJECT_ID]/my-repo/backend \ 
--region us-east1
```

> Your cloud run service does not have to be in the same region as your repository.

The application is now live and listening for requests at the given domain, you can control other aspects such as the maximum number of instances, the RAM, storage, secrets, etc.
## Fly.io
[Fly.io](https://fly.io/) is a platform that is more focused on developer experience while still giving you a lot of control over your infrastructure and services. Fly has machines, volumes, postgres, gpus, kubernetes and more. A machine is your typical virtual machine, while an app is your entire program, which can contain machines, gpus, a database and more.

Fly uses a [`fly.toml`](https://fly.io/docs/reference/configuration/) config file which you can use to customise everything about you app (it also has json and yaml but toml is the default option).

```toml
app = "my-app"
primary_region = "ams"

[http_service]
	internal_port = 8080
	force_https = true
	auto_stop_machines = "false"
	auto_start_machines = true 
	min_machines_running = 0

[env]
	RUST_LOG = "debug"
```

Deploy your app using `fly deploy`. By default the config will look for a `Dockerfile` in the root directory, if you have multiple dockerfiles you can specify which one to use in the `[build]` section.

```toml
[build]
	dockerfile = "Dockerfile.staging"
```

In place of a `Dockerfile` a public image can also be used.

```toml
[build]
	image = "postgres"
```

You also have the option to run a `release_command`, which runs after the image has been built but before it's deployed, on a separate temporary machine.

```toml
[deploy]
	release_command = "target/release/migrate"
```
## Shuttle 
[Shuttle](https://www.shuttle.dev/) is one of the more unique providers, it's made entirely for rust, with an emphasis on managing resources in the source code. Add the `#[shuttle_runtime::main]` attribute to you main function to create a VM.

```rust
use axum::{routing::get,Router};

async fn hello_world() -> &'static str{
	"Hello world!"
}

#[shuttle_runtime::main]
async fn axum() -> shuttle_axum::ShuttleAxum{
	let router = Router::new()
		.route("/",get(hello_world));
	Ok(router.into())
}
```

Your app can now be deployed using `shuttle deploy`.
### Resources
Shuttle provisions resources through attribute macros.
#### Postgres
The `#[shuttle_shared_db::Postgres]` attribute macro can be used to add a postgres database to your app.

```rust
use shuttle_runtime::SecretStore;
use shuttle_axum::ShuttleAxum;
use axum::{routing::get,Router};
use sqlx::PgPool;

#[shuttle_runtime::main]
async fn main(
	#[shuttle_shared_db::Postgres] pool: PgPool
) -> ShuttleAxum{
	let state = AppState::new(pool).await?;
	let router = Router::new()
		.with_state(state);
	Ok(router.into())
}
```

The output can be configured a couple different ways including:

```rust
use diesel_deadpool::Pool;

/// Use the connection string
async fn main(#[shuttle_shared_db::Postgres] conn_str: String) -> ... {...}

/// Connect to a sqlx postgres pool
async fn main(#[shuttle_shared_db::Postgres] pool: sqlx::PgPool) -> ... {...}

/// Use diesel 
async fn main(
	#[shuttle_shared_db::Postgres] pool: Pool<diesel_async::AsyncPgConnection>
) -> ... {...}
```
#### Secrets
Secrets are read from a `Secrets.toml` file at the root of your project.

```toml
DATABASE_URL="postgresql://postgres:db0909@localhost:5432/postgres"
API_KEY="my-secret-key"
```

Now add `#[shuttle_runtime::Secrets] secrets: SecretStore` to your main function.

```rust
use shuttle_runtime::SecretStore;
use shuttle_axum::ShuttleAxum;
use axum::{routing::get,Router};

#[shuttle_runtime::main]
async fn axum(
	#[shuttle_runtime::Secrets] secrets: SecretStore
) -> ShuttleAxum{
	let api_key = secrets.get("API_KEY")
		.context("api key not found")?;
	
	let state = AppState::new(api_key).await?;
	let router = Router::new()
		.with_state(state);
	Ok(router.into())
}
```

Behind the scenes deployments are run on AWS EC2 with Fargate, with 0.25 vCPU's and 500 MB RAM as a default.

Shuttle is designed to be used the way most rust web apps are built. It is **very** opinionated, which is by design, when it works it works well. However it might not be exactly attuned to your use case and there's not much freedom to customise things.
## Supabase
[Supabase](https://supabase.com/) is an open source backend as a service and is meant to be used entirely as a backend with client libraries supporting it. However it does comes with a managed database and authentication, which you can connect to directly, so there are merits to using it with rust. 

You can use a library, like `sqlx`, to connect directly to the database using a connection string `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`.

You would still have to host your rust app on another other platforms. Even though there is no official rust client library, you can actually use most, if not all, of the services through the REST API. The docs have little to no information on this but all their repositories are listed on their [github org](https://github.com/supabase) with documentation on how to use them.
## Pricing comparison
You may have noticed that I didn't include pricing on any of these. Pricing is important however it's very dependant on the region, provider, resources, config and more. All of the above services are free to very cheap for small projects, but the more you need, the more you'll pay. I would have liked to include a comprehensive pricing table but it varies so much so I'll just link the relevant pages:
- [Cloud Run](https://cloud.google.com/run/pricing)
- [Google pricing calculator](https://cloud.google.com/products/calculator?hl=en)
- [Shuttle](https://www.shuttle.dev/pricing)
- [Supabase](https://supabase.com/pricing)
- [Fly.io](https://fly.io/docs/about/pricing/)
- [AWS pricing calculator](https://calculator.aws/#/?nc2=h_ql_pr_calc)
- [Azure pricing calculator](https://azure.microsoft.com/en-ca/pricing/calculator/)

