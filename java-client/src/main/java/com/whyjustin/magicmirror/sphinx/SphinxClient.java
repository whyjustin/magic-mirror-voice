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

import edu.cmu.sphinx.api.Configuration;
import edu.cmu.sphinx.recognizer.Recognizer.State;
import edu.cmu.sphinx.recognizer.StateListener;
import edu.cmu.sphinx.util.props.PropertyException;
import edu.cmu.sphinx.util.props.PropertySheet;
import org.apache.commons.lang3.StringUtils;

public class SphinxClient
    implements StateListener
{
  private final SphinxProxy sphinxProxy;
  private final Configuration configuration;

  private SphinxMirrorRecognizer recognizer;

  private DesiredState desiredState;
  private enum DesiredState {
    NONE,
    START,
    STOP
  }

  public SphinxClient(SphinxConfig sphinxConfig, SphinxProxy sphinxProxy) throws IOException {
    this.sphinxProxy = sphinxProxy;
    configuration = new Configuration();

    configuration.setAcousticModelPath("resource:/edu/cmu/sphinx/models/en-us/en-us");
    configuration.setDictionaryPath("file:" + sphinxConfig.getDictionaryPath());
    configuration.setLanguageModelPath("file:" + sphinxConfig.getLanguageModelPath());
    recognizer = new SphinxMirrorRecognizer(configuration);
    recognizer.addStateListener(this);
  }

  public void listen() {
    desiredState = DesiredState.START;
    if (recognizer.getState() == State.DEALLOCATED) {
      doListen();
    }
  }

  public void stop() {
    desiredState = DesiredState.STOP;
    if (recognizer.getState() == State.READY) {
      doStop();
    }
  }

  private void doListen() {
    try {
      recognizer.startRecognition(true);
      desiredState = DesiredState.NONE;

      while (true) {
        String utterance = recognizer.getResult().getHypothesis();
        if (!StringUtils.isEmpty(utterance)) {
          sphinxProxy.handleCommand(utterance);
          break;
        }
      }
      recognizer.stopRecognition();
    }
    catch (IllegalStateException ex) {
    }
  }

  private void doStop() {
    try {
      recognizer.stopRecognition();
      desiredState = DesiredState.NONE;
    }
    catch (IllegalStateException ex) {
    }
  }

  @Override
  public void statusChanged(final State status) {
    if (desiredState == DesiredState.STOP && status == State.READY) {
      doStop();
    }
    else if (desiredState == DesiredState.START && status == State.DEALLOCATED) {
      doListen();
    }
  }

  @Override
  public void newProperties(final PropertySheet ps) throws PropertyException {

  }
}
