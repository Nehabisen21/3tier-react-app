# AWS EKS 3-Tier Deployment

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip
sudo apt install unzip -y
unzip awscliv2.zip
sudo ./aws/install
aws configure

# Install kubectl
curl -LO https://dl.k8s.io/release/v1.29.0/bin/linux/amd64/kubectl
chmod +x kubectl
sudo mv kubectl /usr/local/bin
kubectl version --short --client

# Install eksctl
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
eksctl version

# Create EKS cluster (no nodegroup)
eksctl create cluster --name K8s-Cluster1 --region us-east-1 --version 1.30 --without-nodegroup

# Associate IAM OIDC
eksctl utils associate-iam-oidc-provider --region us-east-1 --cluster K8s-Cluster1 --approve

# Create nodegroup
eksctl create nodegroup \
  --cluster K8s-Cluster1 \
  --region us-east-1 \
  --name Node \
  --node-type t3.small \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 2 \
  --node-volume-size 29 \
  --ssh-access \
  --ssh-public-key new-aws-key

kubectl get nodes

# Clone repository
git clone https://github.com/Nehabisen21/K8s-3-tier.git
cd K8s-3-tier

# Deploy frontend
cd k8s
kubectl apply -f namespace.yaml
kubectl apply -f frontend-deployment.yaml
kubectl get pods -n react-app
kubectl get svc -n react-app -o wide

# Install Helm
curl -O https://get.helm.sh/helm-v3.16.2-linux-amd64.tar.gz
tar xvf helm-v3.16.2-linux-amd64.tar.gz
sudo mv linux-amd64/helm /usr/local/bin
helm version

# Add Bitnami repo
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Install PostgreSQL
cd ../helm
helm install postgres bitnami/postgresql -f values.yml -n react-app --create-namespace
kubectl get pods -n react-app

# Install EBS CSI Driver
kubectl get pods -n kube-system | grep ebs
aws eks create-addon --cluster-name K8s-Cluster1 --addon-name aws-ebs-csi-driver
eksctl create iamserviceaccount \
  --name ebs-csi-controller-sa \
  --namespace kube-system \
  --cluster K8s-Cluster1 \
  --attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
  --approve \
  --override-existing-serviceaccounts \
  --region us-east-1
kubectl rollout restart deployment ebs-csi-controller -n kube-system

# Reinstall PostgreSQL (PVC fix)
helm uninstall postgres -n react-app
kubectl delete pvc -n react-app --all
helm install postgres bitnami/postgresql -f values.yml -n react-app
kubectl get pods -n react-app
kubectl get pvc -n react-app

# Apply StorageClass
cd ../k8s
kubectl apply -f storage-class.yml

# Create DB secret
kubectl create secret generic postgres-secret \
  --from-literal=postgres-password=StrongPassword123 \
  -n react-app

# Deploy backend
kubectl apply -f configmap.yml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Watch resources
watch kubectl get pods,svc -n react-app
