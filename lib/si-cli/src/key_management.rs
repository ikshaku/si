use crate::{CliResult, SiCliError};
use directories::BaseDirs;
use sodiumoxide::crypto::box_;
use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::PathBuf;

const JWT_SIGNING_KEY: &str = "-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAuoogz71y+EO3tmEAiHCD
90A/AnF6idrD31VY8bkpwYS51UGIlkdUna/yQo6XiXj10rhNkVEAzjwmfoGJbj59
gyFcFZtzsDuI6lOVn6XvSjYuHFPqeyYn8QFlIYBJuMpgiRPwuQK+JN8Ke5PdrOL3
fwL93i9BGJzczuDVK5McAyeuJsuQm8DfJk/BaQYTAjBW2ZI/3IxEUpsOrW9abpFe
Uejnd0fWepbo1M84US4lWAJKXS6+VeUnNaS/msl0T980DnO5oocdY6gWmQPNWikB
JkUxQGNUIfwVMelUgvML8ZUk0LFIphIlJzzcA0nzN6Y1otEezxpfNYVRK+rF3m27
TLmHvISaqUJ58AqBC22YOdgDOY2hkdS9tOQfcr+GJg+REKlfo4nUuodaB0imdwas
nLzqa4veBKPeE37Zw1x2Uph4dtbfEyNHGORTLUqP/j2KP8CLY82Kj40vSVk0l3RN
ERf4e/qM52I2EDYzHej7uYsheouTrRUf9IAyBEkU7WO4L2Y6N/pgyiF/5I5aHcY2
l8l9ozan8igwKyNY7EiB4T8fA3yEkpNhwQAVlF897dUTanb2SjyFBpZxx+POZDpC
fJwjkI25wNiOHD7LI8nWUqXOM0ZcQQ/4HJwG9IT6flvRQwLi9UrC8FTos4jPeZcA
T7Pftf1OUGsDQsmx/eAS4GUCAwEAAQ==
-----END PUBLIC KEY-----";

pub async fn ensure_encryption_keys() -> CliResult<()> {
    let (public_key, secret_key) = box_::gen_keypair();

    let si_data_dir = get_si_data_dir().await?;
    let secret_key_path = si_data_dir.join("cyclone_encryption.key");
    if !secret_key_path.exists() {
        let mut file = File::create(&secret_key_path)?;
        file.write_all(&secret_key.0)?;
    }

    let public_key_path = si_data_dir.join("decryption.key");
    if !public_key_path.exists() {
        let mut file = File::create(&public_key_path)?;
        file.write_all(&public_key.0)?;
    }
    Ok(())
}

pub async fn ensure_jwt_public_signing_key() -> CliResult<()> {
    let si_data_dir = get_si_data_dir().await?;
    let jwt_public_signing_key = si_data_dir.join("jwt_signing_public_key.pem");
    if !jwt_public_signing_key.exists() {
        let mut file = File::create(&jwt_public_signing_key)?;
        file.write_all(JWT_SIGNING_KEY.as_bytes())?;
    }

    Ok(())
}

pub async fn ensure_pkgs_directory() -> CliResult<()> {
    let si_data_dir = get_si_data_dir().await?;
    let pkgs_dir = si_data_dir.join("pkgs");
    if !pkgs_dir.exists() {
        fs::create_dir(pkgs_dir.as_path())?;
    }
    Ok(())
}

pub async fn get_si_data_dir() -> Result<PathBuf, SiCliError> {
    if let Some(base_dirs) = BaseDirs::new() {
        let si_data_dir = base_dirs.data_dir().join("SI");
        let si_dir_exists = si_data_dir.as_path().is_dir();
        if !si_dir_exists {
            fs::create_dir(si_data_dir.as_path())?;
        }
        return Ok(si_data_dir);
    }

    Err(SiCliError::MissingDataDir())
}