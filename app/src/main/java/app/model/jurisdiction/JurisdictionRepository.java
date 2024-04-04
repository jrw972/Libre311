// Copyright 2023 Libre311 Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package app.model.jurisdiction;

import app.exception.Libre311BaseException;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.PageableRepository;
import io.micronaut.http.HttpStatus;
import java.util.Optional;

@Repository
public interface JurisdictionRepository extends PageableRepository<Jurisdiction, String> {

  class JurisdictionNotFoundException extends Libre311BaseException {

    public JurisdictionNotFoundException(String message) {
      super(message, HttpStatus.NOT_FOUND);
    }
  }

  default Jurisdiction findByJurisdictionId(String id){
    return this.findById(id).orElseThrow(() -> new JurisdictionNotFoundException(
        String.format("No Jurisdiction found with id: %s", id)));
  }

  Optional<Jurisdiction> findByRemoteHostsNameEquals(String hosts);
}
