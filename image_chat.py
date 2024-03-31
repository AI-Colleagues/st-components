import streamlit as st

# from file_message import my_component
from chat_input import my_component

# Use it:
value = my_component(name="Hello World")
if value:
    print(value)
    st.chat_message("user").write(value)
