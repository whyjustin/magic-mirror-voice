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
import edu.cmu.sphinx.api.LiveSpeechRecognizer;
import edu.cmu.sphinx.recognizer.Recognizer.State;
import edu.cmu.sphinx.recognizer.StateListener;

public class SphinxMirrorRecognizer
    extends LiveSpeechRecognizer
{
  /**
   * Constructs new live recognition object.
   *
   * @param configuration common configuration
   * @throws IOException if model IO went wrong
   */
  public SphinxMirrorRecognizer(final Configuration configuration) throws IOException {
    super(configuration);
  }

  public State getState() {
    return super.recognizer.getState();
  }

  public void addStateListener(StateListener stateListener) {
    super.recognizer.addStateListener(stateListener);
  }
}
