package com.example.PILL.controller;

import org.springframework.core.io.ByteArrayResource;

public class MultipartFileResource extends ByteArrayResource {

    private final String filename;
    private final long contentLength;

    public MultipartFileResource(byte[] byteArray, String filename) {
        super(byteArray);
        this.filename = filename;
        this.contentLength = byteArray.length;
    }

    @Override
    public String getFilename() {
        return this.filename;
    }

    @Override
    public long contentLength() {
        return this.contentLength;
    }

}