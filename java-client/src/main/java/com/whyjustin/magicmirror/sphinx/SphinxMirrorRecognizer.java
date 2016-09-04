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
 *
 * Copyright 1999-2015 Carnegie Mellon University.
 * Portions Copyright 2002-2008 Sun Microsystems, Inc.
 * Portions Copyright 2002-2008 Mitsubishi Electric Research Laboratories.
 * Portions Copyright 2013-2015 Alpha Cephei, Inc.
 *
 * All Rights Reserved.  Use is subject to license terms.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in
 * the documentation and/or other materials provided with the
 * distribution.
 *
 * 3. Original authors' names are not deleted.
 *
 * 4. The authors' names are not used to endorse or promote products
 * derived from this software without specific prior written
 * permission.
 *
 * This work was supported in part by funding from the Defense Advanced
 * Research Projects Agency and the National Science Foundation of the
 * United States of America, the CMU Sphinx Speech Consortium, and
 * Sun Microsystems, Inc.
 *
 * CARNEGIE MELLON UNIVERSITY, SUN MICROSYSTEMS, INC., MITSUBISHI
 * ELECTRONIC RESEARCH LABORATORIES AND THE CONTRIBUTORS TO THIS WORK
 * DISCLAIM ALL WARRANTIES WITH REGARD TO THIS SOFTWARE, INCLUDING ALL
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL
 * CARNEGIE MELLON UNIVERSITY, SUN MICROSYSTEMS, INC., MITSUBISHI
 * ELECTRONIC RESEARCH LABORATORIES NOR THE CONTRIBUTORS BE LIABLE FOR
 * ANY SPECIAL, INDIRECT OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT
 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
package com.whyjustin.magicmirror.sphinx;

import java.io.IOException;

import edu.cmu.sphinx.api.AbstractSpeechRecognizer;
import edu.cmu.sphinx.api.Configuration;
import edu.cmu.sphinx.api.LiveSpeechRecognizer;
import edu.cmu.sphinx.api.Microphone;
import edu.cmu.sphinx.frontend.util.StreamDataSource;
import edu.cmu.sphinx.recognizer.Recognizer.State;

public class SphinxMirrorRecognizer
    extends AbstractSpeechRecognizer
{
  private final Microphone microphone = new Microphone(16000, 16, true, false);

  /**
   * Constructs new live recognition object.
   *
   * @param configuration common configuration
   * @throws IOException if model IO went wrong
   */
  public SphinxMirrorRecognizer(final Configuration configuration) throws IOException {
    super(configuration);

    context.getInstance(StreamDataSource.class).setInputStream(microphone.getStream());
    recognizer.allocate();

    Runtime.getRuntime().addShutdownHook(new Thread(() -> {
      recognizer.deallocate();
    }));
  }

  public State getState() {
    return super.recognizer.getState();
  }

  /**
   * Starts recognition process.
   *
   * @see         LiveSpeechRecognizer#stopRecognition()
   */
  public void startRecognition() {
    microphone.startRecording();
  }

  /**
   * Stops recognition process.
   *
   * Recognition process is paused until the next call to startRecognition.
   *
   * @see LiveSpeechRecognizer#startRecognition(boolean)
   */
  public void stopRecognition() {
    microphone.stopRecording();
  }
}
