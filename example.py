import streamlit as st

from file_message import file_chat_input
from streamlit_float import float_init

float_init()

container = st.container()
with container:
    message = file_chat_input("Type a message...")

if message:
    st.write(message)


container.float("bottom: 0")
