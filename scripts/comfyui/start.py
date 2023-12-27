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
    conda_exist = run_cmd("conda", environment=True,
                          capture_output=True).returncode == 0
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
            conda_bat_path = os.path.join(
                script_dir, "installer_files", "conda", "condabin", "conda.bat")
            cmd = "\"" + conda_bat_path + "\" activate \"" + \
                conda_env_path + "\" >nul && " + cmd
        else:
            conda_sh_path = os.path.join(
                script_dir, "installer_files", "conda", "etc", "profile.d", "conda.sh")
            cmd = ". \"" + conda_sh_path + "\" && conda activate \"" + \
                conda_env_path + "\" && " + cmd

    # Run shell commands
    result = subprocess.run(
        cmd, shell=True, capture_output=capture_output, env=env)

    # Assert the command ran successfully
    if assert_success and result.returncode != 0:
        print("Command '" + cmd + "' failed with exit status code '" + str(result.returncode) +
              "'.\n\nExiting now.\nTry running the start/update script again.")
        sys.exit(1)

    return result


def install_webui():
    # Find the proper Pytorch installation command
    install_git = "conda install -y -k ninja git"
    install_pytorch = "python -m pip install torch torchvision torchaudio"
    # fix: 依赖补丁 有些插件代码中引入了依赖包但是requirements.txt中却没有声明
    install_patch = "python -m pip install opencv-python matplotlib scikit-image onnxruntime imageio-ffmpeg numexpr pandas"
    install_conda_patch = 'conda install -y -k ffmpeg'
    if is_windows():
        install_patch += " onnxruntime-gpu"
    # Set pip mirror to Tsinghua mirror
    set_pip_mirror = "python -m pip config set global.index-url https://mirror.baidu.com/pypi/simple"

    use_cuda118 = "N"
    if is_windows():
        install_pytorch = f"python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121"
    elif is_macos():
        install_pytorch = f"python -m pip install --pre torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/nightly/cpu"

    # Install Git and then Pytorch
    run_cmd(f"{set_pip_mirror} && {install_git} && {install_conda_patch} && {install_pytorch} && {install_patch}",
            assert_success=True, environment=True)

    # Install CUDA libraries (this wasn't necessary for Pytorch before...)
    if is_windows():
        run_cmd(
            f"conda install -y -c \"nvidia/label/{'cuda-12.1.1' if use_cuda118 == 'N' else 'cuda-11.8.0'}\" cuda-runtime", assert_success=True, environment=True)

    if not os.path.exists("ComfyUI/"):
        run_cmd(
            "git clone https://e.coding.net/g-xeps0419/doraemon/ComfyUI.git", environment=True)

    # Install the requirements
    comfyui_req_path = os.path.join("ComfyUI", "requirements.txt")
    run_cmd("python -m pip install -r " + comfyui_req_path, environment=True)


def update_requirements():
    if os.path.exists("ComfyUI/"):
        os.chdir("ComfyUI")
        run_cmd("git reset --hard && git pull",
                assert_success=True, environment=True)

        set_pip_mirror = "python -m pip config set global.index-url https://mirror.baidu.com/pypi/simple"
        # fix: 依赖补丁 有些插件代码中引入了依赖包但是requirements.txt中却没有声明
        install_patch = "python -m pip install opencv-python matplotlib scikit-image onnxruntime imageio-ffmpeg numexpr pandas"
        install_conda_patch = 'conda install -y -k ffmpeg'
        if is_windows():
            install_patch += " onnxruntime-gpu"

        run_cmd(f"{set_pip_mirror} && {install_conda_patch} && {install_patch} && python -m pip install -r requirements.txt --upgrade",
                assert_success=True, environment=True)

        os.chdir("..")
    else:
        print("ComfyUI文件夹不存在，请先执行启动按钮进行下载")
        sys.exit(1)

    clear_cache()


def launch_webui(cpu=False):
    os.chdir("ComfyUI")

    # Set pip mirror to Tsinghua mirror
    set_pip_mirror = "python -m pip config set global.index-url https://mirror.baidu.com/pypi/simple"

    if is_windows():
        if cpu:
            run_cmd(
                f"{set_pip_mirror} && python main.py --cpu --auto-launch", environment=True)
        else:
            run_cmd(
                f"{set_pip_mirror} && python main.py --auto-launch", environment=True)
    elif is_macos():
        run_cmd(
            f"{set_pip_mirror} && python main.py --force-fp16 --auto-launch", environment=True)


if __name__ == "__main__":
    # Verifies we are in a conda environment
    check_env()

    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument('--update', action='store_true',
                        help='Update the web UI.')
    parser.add_argument('--cpu', action='store_true',
                        help='Start the web UI with CPU.')
    args, _ = parser.parse_known_args()

    if args.update:
        update_requirements()
    else:
        # If webui has already been installed, skip and run
        if not is_installed():
            install_webui()
            os.chdir(script_dir)

        launch_webui(args.cpu)
