import argparse
import os
import platform
import signal
import site
import subprocess
import sys

script_dir = os.getcwd()
conda_env_path = os.path.join(script_dir, "installer_files", "env")


def signal_handler(sig, frame):
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)


def is_linux():
    return sys.platform.startswith("linux")


def is_windows():
    return sys.platform.startswith("win")


def is_macos():
    return sys.platform.startswith("darwin")


def is_x86_64():
    return platform.machine() == "x86_64"


def is_installed():
    site_packages_path = None
    for sitedir in site.getsitepackages():
        if "site-packages" in sitedir and conda_env_path in sitedir:
            site_packages_path = sitedir
            break

    if site_packages_path:
        return os.path.isfile(os.path.join(site_packages_path, 'torch', '__init__.py'))
    else:
        return os.path.isdir(conda_env_path)


def check_env():
    # If we have access to conda, we are probably in an environment
    conda_exist = run_cmd("conda", environment=True, capture_output=True).returncode == 0
    if not conda_exist:
        print("Conda is not installed. Exiting...")
        sys.exit(1)

    # Ensure this is a new environment and not the base environment
    if os.environ["CONDA_DEFAULT_ENV"] == "base":
        print("Create an environment for this project and activate it. Exiting...")
        sys.exit(1)


def clear_cache():
    run_cmd("conda clean -a -y", environment=True)
    run_cmd("python -m pip cache purge", environment=True)


def run_cmd(cmd, assert_success=False, environment=False, capture_output=False, env=None):
    # Use the conda environment
    if environment:
        if is_windows():
            conda_bat_path = os.path.join(script_dir, "installer_files", "conda", "condabin", "conda.bat")
            cmd = "\"" + conda_bat_path + "\" activate \"" + conda_env_path + "\" >nul && " + cmd
        else:
            conda_sh_path = os.path.join(script_dir, "installer_files", "conda", "etc", "profile.d", "conda.sh")
            cmd = ". \"" + conda_sh_path + "\" && conda activate \"" + conda_env_path + "\" && " + cmd

    # Run shell commands
    result = subprocess.run(cmd, shell=True, capture_output=capture_output, env=env)

    # Assert the command ran successfully
    if assert_success and result.returncode != 0:
        print("Command '" + cmd + "' failed with exit status code '" + str(result.returncode) + "'.\n\nExiting now.\nTry running the start/update script again.")
        sys.exit(1)

    return result


def install_webui():
    # Find the proper Pytorch installation command
    install_git = "conda install -y -k ninja git"
    install_pytorch = "python -m pip install torch torchvision torchaudio"
    
    # install training dependences
    install_panopticapi = "python -m pip install git+https://github.com/cocodataset/panopticapi.git"
    install_pycocotools = "python -m pip install pycocotools -i https://pypi.douban.com/simple"
    install_lvis = "python -m pip install lvis"
    
    # Set pip mirror to Tsinghua mirror
    set_pip_mirror = "python -m pip config set global.index-url https://mirror.baidu.com/pypi/simple"
    
    use_cuda118 = "N"
    if is_windows():
        install_pytorch = f"python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121"
    
    # Install Git and then Pytorch
    run_cmd(f"{set_pip_mirror} && {install_git} && {install_pytorch} && {install_panopticapi} && {install_pycocotools} && {install_lvis} && python -m pip install py-cpuinfo==9.0.0", assert_success=True, environment=True)

    # Install CUDA libraries (this wasn't necessary for Pytorch before...)
    if is_windows():
        run_cmd(f"conda install -y -c \"nvidia/label/{'cuda-12.1.1' if use_cuda118 == 'N' else 'cuda-11.8.0'}\" cuda-runtime", assert_success=True, environment=True)

    if not os.path.exists("AnyDoor/"):
        run_cmd("git clone https://e.coding.net/g-xeps0419/doraemon/AnyDoor.git", environment=True)
        
    # Install the requirements
    anydoor_req_path = os.path.join("AnyDoor", "requirements.txt")
    run_cmd("python -m pip install -r " + anydoor_req_path, environment=True)


def update_requirements():
    if os.path.exists("AnyDoor/"):
        os.chdir("AnyDoor")
        run_cmd("git reset --hard && git pull", assert_success=True, environment=True)
        
        set_pip_mirror = "python -m pip config set global.index-url https://mirror.baidu.com/pypi/simple"
        
        run_cmd(f"{set_pip_mirror} && python -m pip install -r requirements.txt --upgrade", assert_success=True, environment=True)
        
        os.chdir("..")
    else:
        print("AnyDoor文件夹不存在，请先执行启动按钮进行下载")
        sys.exit(1)
        
    clear_cache()


def launch_webui(cpu = False):
    anydoor_path = os.path.join("AnyDoor", 'run_gradio_demo.py')
    
    if is_windows():
        if cpu: 
            run_cmd(f"python {anydoor_path} --cpu --auto-launch", environment=True)


if __name__ == "__main__":
    # Verifies we are in a conda environment
    check_env()

    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument('--update', action='store_true', help='Update the web UI.')
    parser.add_argument('--cpu', action='store_true', help='Start the web UI with CPU.')
    args, _ = parser.parse_known_args()

    if args.update:
        update_requirements()
    else:
        # If webui has already been installed, skip and run
        if not is_installed():
            install_webui()
            os.chdir(script_dir)

        launch_webui(args.cpu)
