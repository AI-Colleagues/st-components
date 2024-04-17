import streamlit as st

from file_message import my_component
from streamlit_float import float_init

float_init()

container = st.container()
with container:
    message = my_component("Type a message...")

if message:
    st.write(message)


container.float("bottom: 0")
