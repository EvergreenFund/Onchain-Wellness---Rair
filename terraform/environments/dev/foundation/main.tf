terraform {
  backend "gcs" {
    bucket  = "foundation-terraform-rair-market-dev"
    prefix  = "terraform/state"
  }
}

provider "google" {
  project     = "rair-market-dev"
}

provider "hcp" {}

module "config" {
  source = "../../shared/env_config"
}

module "foundation" {
  source = "../../../modules/foundation"

  env_name                              = module.config.env_config.dev.env_name
  region                                = module.config.env_config.dev.region
  gcp_project_id                        = module.config.env_config.dev.gcp_project_id
  vpc_cidr_block                        = module.config.env_config.dev.vpc_cidr_block
  mongo_atlas_org_id                    = module.config.mongo_atlas_org_id
  jenkins_internal_load_balancer_name   = module.config.jenkins_internal_load_balancer_name
  redis_internal_load_balancer_name     = module.config.redis_internal_load_balancer_name
  rair_internal_load_balancer_name      = module.config.rair_internal_load_balancer_name
  obfuscated_project_id                 = module.config.env_config.dev.obfuscated_project_id
  minting_marketplace_managed_cert_name = module.config.env_config.dev.minting_marketplace_managed_cert_name
  minting_marketplace_static_ip_name    = module.config.env_config.dev.minting_marketplace_static_ip_name
  minting_marketplace_subdomain         = module.config.env_config.dev.minting_marketplace_subdomain
  account_users                         = [
    {
      email: module.config.users.brian.email,
      role: "roles/editor"
    },
    {
      email: module.config.users.zeph.email,
      role: "roles/editor"
    },
    {
      email: module.config.users.ramki.email,
      role: "roles/viewer"
    }
  ]
  secret_adder_role_users = [
    module.config.users.brian.email,
    module.config.users.zeph.email
  ]
}

module "hcp_cloud" {
  source = "../../../modules/hcp_cloud"
  env_name = module.config.env_config.dev.env_name
  vault_cluster_tier = "dev"
}

output "complete_output" {
  value = module.foundation.complete_output
}