package app;

import app.dto.service.ServiceDTO;
import app.dto.service.ServiceList;
import app.dto.servicedefinition.ServiceDefinitionDTO;
import app.dto.servicerequest.*;
import app.service.service.ServiceService;
import app.service.servicedefinition.ServiceDefinitionService;
import app.service.servicerequest.ServiceRequestService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.micronaut.data.model.Pageable;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;

import javax.validation.Valid;
import java.util.List;

@Controller("/api")
public class RootController {

    private final ServiceService serviceService;
    private final ServiceRequestService serviceRequestService;
    private final ServiceDefinitionService serviceDefinitionService;

    public RootController(ServiceService serviceService, ServiceRequestService serviceRequestService, ServiceDefinitionService serviceDefinitionService) {
        this.serviceService = serviceService;
        this.serviceRequestService = serviceRequestService;
        this.serviceDefinitionService = serviceDefinitionService;
    }

    @Get(uris = {"/services", "/services.json"})
    @Produces(MediaType.APPLICATION_JSON)
    @ExecuteOn(TaskExecutors.IO)
    public List<ServiceDTO> indexJson(@Valid Pageable pageable) {
        return serviceService.findAll(pageable);
    }

    @Get("/services.xml")
    @Produces(MediaType.TEXT_XML)
    @ExecuteOn(TaskExecutors.IO)
    public String indexXml(@Valid Pageable pageable) throws JsonProcessingException {
        XmlMapper xmlMapper = XmlMapper.xmlBuilder().defaultUseWrapper(false).build();
        ServiceList serviceList = new ServiceList(serviceService.findAll(pageable));

        return xmlMapper.writeValueAsString(serviceList);
    }

    @Get(uris = {"/services/{serviceCode}", "/services/{serviceCode}.json"})
    @Produces(MediaType.APPLICATION_JSON)
    @ExecuteOn(TaskExecutors.IO)
    public ServiceDefinitionDTO getServiceDefinitionJson(String serviceCode) {
        return serviceDefinitionService.getServiceDefinition(serviceCode);
    }

//    @Get("/services.xml")
//    @Produces(MediaType.TEXT_XML)
//    @ExecuteOn(TaskExecutors.IO)
//    public String getServiceDefinitionXml(@Valid Pageable pageable) throws JsonProcessingException {
//        XmlMapper xmlMapper = XmlMapper.xmlBuilder().defaultUseWrapper(false).build();
//        ServiceList serviceList = new ServiceList(serviceService.findAll(pageable));
//
//        return xmlMapper.writeValueAsString(serviceList);
//    }

    @Post(uris = {"/requests", "/requests.json"})
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @ExecuteOn(TaskExecutors.IO)
    public List<PostResponseServiceRequestDTO> createServiceRequestJson(@Valid @Body PostRequestServiceRequestDTO requestDTO) {
        return List.of(serviceRequestService.createServiceRequest(requestDTO));
    }

    @Post("/requests.xml")
    @Produces(MediaType.TEXT_XML)
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    @ExecuteOn(TaskExecutors.IO)
    public String createServiceRequestXml(@Valid @Body PostRequestServiceRequestDTO requestDTO) throws JsonProcessingException {
        XmlMapper xmlMapper = XmlMapper.xmlBuilder().defaultUseWrapper(false).build();
        ServiceRequestList serviceRequestList = new ServiceRequestList(List.of(serviceRequestService.createServiceRequest(requestDTO)));

        return xmlMapper.writeValueAsString(serviceRequestList);
    }

    @Get(uris = {"/requests", "/requests.json"})
    @Produces(MediaType.APPLICATION_JSON)
    @ExecuteOn(TaskExecutors.IO)
    public List<ServiceRequestDTO> getServiceRequestsJson(@Valid @RequestBean GetServiceRequestsDTO requestDTO) {
        return serviceRequestService.findAll(requestDTO);
    }

    @Get("/requests.xml")
    @Produces(MediaType.TEXT_XML)
    @ExecuteOn(TaskExecutors.IO)
    public String getServiceRequestsXml(@Valid @RequestBean GetServiceRequestsDTO requestDTO) throws JsonProcessingException {
        XmlMapper xmlMapper = XmlMapper.xmlBuilder().defaultUseWrapper(false).build();
        xmlMapper.registerModule(new JavaTimeModule());
        ServiceRequestList serviceRequestList = new ServiceRequestList(serviceRequestService.findAll(requestDTO));

        return xmlMapper.writeValueAsString(serviceRequestList);
    }

    @Get(uris = {"/requests/{serviceRequestId}", "/requests/{serviceRequestId}.json"})
    @Produces(MediaType.APPLICATION_JSON)
    @ExecuteOn(TaskExecutors.IO)
    public List<ServiceRequestDTO> getServiceRequestJson(String serviceRequestId) {
        return List.of(serviceRequestService.getServiceRequest(serviceRequestId));
    }

    @Get("/requests/{serviceRequestId}.xml")
    @Produces(MediaType.TEXT_XML)
    @ExecuteOn(TaskExecutors.IO)
    public String getServiceRequestXml(String serviceRequestId) throws JsonProcessingException {
        XmlMapper xmlMapper = XmlMapper.xmlBuilder().defaultUseWrapper(false).build();
        xmlMapper.registerModule(new JavaTimeModule());
        ServiceRequestList serviceRequestList = new ServiceRequestList(List.of(serviceRequestService.getServiceRequest(serviceRequestId)));

        return xmlMapper.writeValueAsString(serviceRequestList);
    }
}
