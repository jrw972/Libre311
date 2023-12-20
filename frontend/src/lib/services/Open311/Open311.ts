import { z } from 'zod';

const JurisdicationIdSchema = z.string();
const HasJurisdictionIdSchema = z.object({
	jurisdiction_id: JurisdicationIdSchema
});
export type HasJurisdictionId = z.infer<typeof HasJurisdictionIdSchema>;
export type JurisdictionId = z.infer<typeof JurisdicationIdSchema>;

const RealtimeServiceTypeSchema = z.literal('realtime');
const OtherServiceTypeSchema = z.literal('other'); // todo remove once second type is found
const ServiceTypeSchema = z.union([RealtimeServiceTypeSchema, OtherServiceTypeSchema]); // todo what are the other types besides realtime?

const ServiceCodeSchema = z.string();
const HasServiceCodeSchema = z.object({
	service_code: ServiceCodeSchema
});

type HasServiceCode = z.infer<typeof HasServiceCodeSchema>;
type ServiceCode = z.infer<typeof ServiceCodeSchema>;

export const ServiceSchema = HasServiceCodeSchema.extend({
	service_name: z.string(),
	description: z.string(),
	metadata: z.boolean(),
	type: ServiceTypeSchema,
	keywords: z.array(z.string()),
	group: z.string()
});

export type Service = z.infer<typeof ServiceSchema>;

const StringType = z.literal('string');
const NumberType = z.literal('number');
const DatetimeType = z.literal('datetime');
const TextType = z.literal('text');
const SingleValueListType = z.literal('singlevaluelist');
const MultiValueListType = z.literal('multivaluelist');

const DatatypeUnionSchema = z.union([
	StringType,
	NumberType,
	DatetimeType,
	TextType,
	SingleValueListType,
	MultiValueListType
]);

// const ServiceDefinitionAttributeCode
export const BaseServiceDefinitionAttributeSchema = z.object({
	/**
	 * true: denotes that user input is needed
	 * false: means the attribute is only used to present information to the user within the description field
	 */
	variable: z.boolean(),
	code: z.string(),
	datatype: DatatypeUnionSchema,
	required: z.boolean(),
	/**
	 * A description of the datatype which helps the user provide their input
	 */
	datatype_description: z.string().nullish(), // probably is the helperText
	order: z.number(),
	/**
	 * The actual question
	 */
	description: z.string()
});

export const NonListBasedServiceDefinitionAttributeSchema =
	BaseServiceDefinitionAttributeSchema.extend({
		datatype: z.union([StringType, NumberType, DatetimeType, TextType])
	});

const AttributeValueSchema = z.object({
	/**
	 * The unique identifier associated with an option for singlevaluelist or multivaluelist. This is analogous to the value attribute in an html option tag.
	 */
	key: z.number(),
	/**
	 * The human readable title of an option for singlevaluelist or multivaluelist. This is analogous to the innerhtml text node of an html option tag.
	 */
	name: z.string()
});
export const ListBasedServiceDefinitionAttributeSchema =
	BaseServiceDefinitionAttributeSchema.extend({
		datatype: z.union([SingleValueListType, MultiValueListType]),
		values: z.array(AttributeValueSchema)
	});

export const ServiceDefinitionAttributeSchema = z.union([
	NonListBasedServiceDefinitionAttributeSchema,
	ListBasedServiceDefinitionAttributeSchema
]);

type ServiceDefinitionAttribute = z.infer<typeof ServiceDefinitionAttributeSchema>;

const ServiceDefinitionSchema = z.object({
	service_code: z.string(),
	attributes: z.array(ServiceDefinitionAttributeSchema)
});

export type ServiceDefinition = z.infer<typeof ServiceDefinitionSchema>;

const HasServiceRequestIdSchema = z.object({
	service_request_id: z.number()
});

export type HasServiceRequestId = z.infer<typeof HasServiceRequestIdSchema>;
export type ServiceRequestId = HasServiceRequestId['service_request_id'];

export const CreateServiceRequestResponseSchema = HasServiceRequestIdSchema.extend({
	service_notice: z.string().nullish(),
	account_id: z.number().nullish()
});

export type CreateServiceRequestResponse = z.infer<typeof CreateServiceRequestResponseSchema>;

export const GetServiceListResponseSchema = z.array(ServiceSchema);
export type GetServiceListResponse = z.infer<typeof GetServiceListResponseSchema>;

// user response values from  ServiceDefinitionAttributeSchema.
// attribute[code1]=value1
// ServiceDefinitionAttributeCode
type AttributeResponse = { code: ServiceDefinitionAttribute['code']; value: string };
// todo revisit params, they list a ton of optional that we may want to require
// todo will likely need the recaptcha value here
export type CreateServiceRequestParams = HasJurisdictionId &
	HasServiceCode & {
		lat: string;
		lng: string;
		address_string: string;
		attributes: AttributeResponse[];
		description: string;
		media_url?: string;
	};

export const OpenServiceRequestStatusSchema = z.literal('Open');
export const ClosedServiceRequestStatusSchema = z.literal('Closed');
export const ServiceRequestStatusSchema = z.union([
	OpenServiceRequestStatusSchema,
	ClosedServiceRequestStatusSchema
]);
export type ServiceRequestStatus = z.infer<typeof ServiceRequestStatusSchema>;

export const ServiceRequestSchema = HasServiceRequestIdSchema.extend({
	HasServiceCodeSchema
}).extend({
	status: ServiceRequestStatusSchema,
	status_notes: z.string().nullish(),
	service_name: z.string(),
	description: z.string().nullish(),
	agency_responsible: z.string().nullish(),
	service_notice: z.string().nullish(),
	requested_datetime: z.string(),
	updated_datetime: z.string(),
	expected_datetime: z.string(),
	address: z.string(),
	address_id: z.number().nullish(),
	zipcode: z.number(),
	lat: z.number(),
	long: z.number(),
	media_url: z.string().nullish()
});

export type ServiceRequest = z.infer<typeof ServiceRequestSchema>;

export const GetServiceRequestsResponseSchema = z.array(ServiceRequestSchema);
export type GetServiceRequestsResponse = z.infer<typeof GetServiceRequestsResponseSchema>;

// service_request_id array or query params
// todo add pagination params
type GetServiceRequestsParams =
	| ServiceRequestId[]
	| {
			service_code?: ServiceCode;
			start_date?: string;
			end_date?: string;
			status?: ServiceRequestStatus[];
	  };

export interface Open311 {
	// https://wiki.open311.org/GeoReport_v2/#get-service-list
	getServiceList(params: HasJurisdictionId): Promise<GetServiceListResponse>;
	// https://wiki.open311.org/GeoReport_v2/#get-service-definition
	getServiceDefinition(params: HasJurisdictionId & HasServiceCode): Promise<ServiceDefinition>;
	// https://wiki.open311.org/GeoReport_v2/#post-service-request
	createServiceRequest(params: CreateServiceRequestParams): Promise<CreateServiceRequestResponse>;
	// https://wiki.open311.org/GeoReport_v2/#get-service-requests
	getServiceRequests(params: GetServiceRequestsParams): Promise<GetServiceRequestsResponse>;
	// https://wiki.open311.org/GeoReport_v2/#get-service-request
	getServiceRequest(params: HasJurisdictionId & HasServiceRequestId): Promise<ServiceRequest>;
}
