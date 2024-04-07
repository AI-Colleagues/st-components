import streamlit as st

from file_message import my_component

message = my_component("file_message")

if message:
    st.write(message)
