FROM python:3.11

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./src /code/src

EXPOSE 3002
CMD ["uvicorn", "src.app:app", "--proxy-headers",  "--host", "0.0.0.0", "--port", "3002"]