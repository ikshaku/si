use std::env::args;

use petgraph::dot::{Config, Dot};
use si_pkg::SiPkg;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut args = args();
    let path = args.nth(1).expect("usage: program <DIR>");

    println!("--- Reading object tree from dir: {path}");
    let pkg = SiPkg::load_from_dir(path).await?;

    let (graph, _root_idx) = pkg.as_petgraph();
    println!(
        "\n---- snip ----\n{:?}\n---- snip ----\n",
        Dot::with_config(graph, &[Config::EdgeNoLabel])
    );

    println!("--- Done.");
    Ok(())
}
