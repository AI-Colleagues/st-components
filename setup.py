from pathlib import Path

import setuptools

this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()

setuptools.setup(
    name="file-chat-input",
    version="0.0.2",
    author="Shaojie Jiang",
    author_email="shaojie.jiang1@gmail.com",
    description="Streamlit chat input that allows file attachments.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/AI-Colleagues/st-components",
    packages=setuptools.find_packages(),
    include_package_data=True,
    classifiers=[],
    python_requires=">=3.7",
    install_requires=[
        # By definition, a Custom Component depends on Streamlit.
        # If your component has other Python dependencies, list
        # them here.
        "streamlit>=1.32.0",
        "streamlit-float>=0.3.2",
    ],
    extras_require={
        "devel": [
            "wheel",
            "pytest==7.4.0",
            "playwright==1.39.0",
            "requests==2.31.0",
            "pytest-playwright-snapshot==1.0",
            "pytest-rerunfailures==12.0",
        ]
    }
)