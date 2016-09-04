/**
 * Copyright (c) 2016 Justin Young
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 */
package com.whyjustin.magicmirror.sphinx;

import java.io.IOException;

import javax.sound.sampled.LineUnavailableException;

import edu.cmu.sphinx.api.Configuration;
import edu.cmu.sphinx.recognizer.Recognizer.State;
import org.apache.commons.lang3.StringUtils;

public class SphinxClient
{
  private final SphinxProxy sphinxProxy;
  private final Configuration configuration;

  private boolean isListening = false;

  private SphinxMirrorRecognizer recognizer;

  public SphinxClient(SphinxConfig sphinxConfig, SphinxProxy sphinxProxy) throws IOException {
    this.sphinxProxy = sphinxProxy;
    configuration = new Configuration();

    configuration.setAcousticModelPath("resource:/edu/cmu/sphinx/models/en-us/en-us");
    configuration.setDictionaryPath("file:" + sphinxConfig.getDictionaryPath());
    configuration.setLanguageModelPath("file:" + sphinxConfig.getLanguageModelPath());

    recognizer = new SphinxMirrorRecognizer(configuration);
  }

  public boolean isListening() {
    return isListening;
  }

  public void listen() throws IOException, LineUnavailableException {
    if (isListening || recognizer.getState() == State.RECOGNIZING) {
      return;
    }
    isListening = true;
    recognizer.startRecognition();

    String utterance;
    while (true) {
      utterance = recognizer.getResult().getHypothesis();
      if (!StringUtils.isEmpty(utterance)) {
        break;
      }
    }
    recognizer.stopRecognition();
    isListening = false;
    sphinxProxy.handleCommand(utterance);
  }

  public void stop() {
    recognizer.stopRecognition();
    isListening = false;
  }
}
