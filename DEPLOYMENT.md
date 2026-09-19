# AWS EKS deployment

The repository contains independent client and server pipelines in
`.github/workflows`. Both run CI for pull requests. A push to `master`, or a
manual run, also publishes an immutable commit-SHA image plus a `latest` tag to
Docker Hub and deploys it to EKS.

## Prerequisites

- An EKS cluster with worker nodes and a default EBS-backed StorageClass.
- The AWS Load Balancer Controller is not required, but the NGINX Ingress
  Controller must be installed in the cluster.
- A DNS record for the application hostname pointing to the NGINX ingress load
  balancer.
- Docker Hub repositories named `pern-client` and `pern-server`. The manifests
  assume these repositories are public. Add an `imagePullSecret` to the
  Deployments if they are private.
- A TLS certificate and matching private key for the application hostname.

The AWS identity used by GitHub Actions needs permission to call
`eks:DescribeCluster` and must be granted Kubernetes access to deploy resources.

## GitHub repository configuration

Create these Actions secrets:

- `DOCKERHUB_USERNAME`: Docker Hub account or organization.
- `DOCKERHUB_PASSWORD`: Docker Hub access token.
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: credentials for the EKS
  deployer. Prefer replacing long-lived keys with GitHub OIDC when the AWS
  account is ready for it.
- `POSTGRES_PASSWORD`: strong password for the in-cluster PostgreSQL instance.
- `JWT_SECRET`: long random signing secret.
- `TLS_CERTIFICATE`: PEM-encoded certificate, including any intermediate
  certificates.
- `TLS_PRIVATE_KEY`: PEM-encoded private key matching the certificate.

Create these Actions variables:

- `AWS_REGION`: EKS region. It defaults to `ap-southeast-2`.
- `EKS_CLUSTER_NAME`: exact EKS cluster name.
- `APP_HOST`: public DNS hostname, without a scheme or path.
- `CORS_ORIGIN`: public origin in the form `https://APP_HOST`.

For extra protection, create a GitHub environment named `production`, move the
deployment secrets into it, and add required reviewers.

## First deployment

1. Install NGINX Ingress Controller and wait for its LoadBalancer service to
   receive an external address.
2. Configure the GitHub secrets and variables above.
3. Run `Server CI/CD` manually. It creates the namespace, application
   configuration and secrets, PostgreSQL StatefulSet, migration Job, and server
   Deployment.
4. Run `Client CI/CD` manually. It creates the TLS secret, client Deployment,
   services, and ingress routes.
5. Point `APP_HOST` DNS to the NGINX external address if it was not configured
   already, then open `https://APP_HOST`.

The `/api` ingress strips that prefix before forwarding requests to Express.
The client image is built with `/api` as its API base URL, and Socket.IO uses
`/api/socket.io` through the same hostname.

## Kubernetes resources

Resources are in `k8s/aws/pern`. PostgreSQL data is stored in a 10 Gi
`ReadWriteOnce` persistent volume. Deleting the StatefulSet does not delete its
claim; delete the claim explicitly only when permanent data removal is intended.

The committed ConfigMap contains local-safe defaults for manual use. During an
EKS deployment, the server workflow creates or updates the same ConfigMap with
the configured production CORS origin. Runtime credentials are never stored in
the repository.

To inspect a release:

```sh
kubectl -n pern get pods,services,ingress,pvc
kubectl -n pern logs deployment/pern-server
kubectl -n pern describe ingress pern-api pern-web
```
